// =============================================
// Confamily — Google Apps Script Backend v2.0
// =============================================
// SETUP :
// 1. Créez un Google Sheet nommé "Confamily_DB"
// 2. Créez ces 7 feuilles (onglets) :
//    Users | Members | Relations | Messages | Sessions | Invites | TreeBridges
// 3. Dans chaque feuille, ajoutez la ligne d'en-têtes suivante (ligne 1) :
//    Users       : email | pwdHash | name | userId | treeId | isPremium | createdAt
//    Members     : treeId | memberId | firstName | lastName | birthDate | location | profession | photoUrl | relation | gender | isAlive | linkedUserId | createdAt
//    Relations   : treeId | fromId | toId | type | createdAt
//    Messages    : msgId | fromId | toId | content | groupId | treeId | timestamp
//    Sessions    : sessionId | userId | createdAt | expiresAt
//    Invites     : code | treeId | memberId | createdBy | expiresAt | usedAt
//    TreeBridges : bridgeId | tree1Id | member1Id | tree2Id | member2Id | status | createdAt
// 4. Déployez : Extensions → Apps Script → Déployer → Nouvelle application Web
//    Exécuter en tant que : Moi | Accès : Tout le monde
// 5. Copiez l'URL de déploiement → mettez-la dans src/api/googleAPI.ts
// =============================================

const SHEET_ID = 'VOTRE_SHEET_ID_ICI'; // ← Remplacez par l'ID de votre Google Sheet
const SESSION_DURATION_DAYS = 7;
const INVITE_DURATION_DAYS = 7;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function uid() {
  return Utilities.getUuid();
}

function shortCode() {
  return Math.random().toString(36).substr(2, 10).toUpperCase();
}

// MD5 password hash (one-way)
function hashPassword(password) {
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    password,
    Utilities.Charset.UTF_8
  );
  return rawHash.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function addDays(date, days) {
  var d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────

function doGet(e) { return route(e); }
function doPost(e) { return route(e); }

function route(e) {
  var p = e.parameter || {};
  var action = p.action;
  var result;

  try {
    // Public routes (no session required)
    if (action === 'register')      return jsonOut(registerUser(p));
    if (action === 'login')         return jsonOut(loginUser(p));
    if (action === 'resolveInvite') return jsonOut(resolveInvite(p));
    if (action === 'requestPasswordReset') return jsonOut(requestPasswordReset(p));
    if (action === 'resetPassword') return jsonOut(resetPassword(p));
    if (action === 'deleteAccount') return jsonOut(deleteAccount(p, validateSession(p.sessionId)));

    // Protected routes — validate session first
    var session = validateSession(p.sessionId);
    if (!session.valid) return jsonOut({ success: false, error: 'Session invalide ou expirée. Veuillez vous reconnecter.' });

    switch (action) {
      // Members & Tree
      case 'getTree':          result = getTree(p, session); break;
      case 'addMember':        result = addMember(p, session); break;
      case 'updateMember':     result = updateMember(p, session); break;
      case 'removeMember':     result = removeMember(p, session); break;
      case 'addRelation':      result = addRelation(p, session); break;
      case 'removeRelation':   result = removeRelation(p, session); break;
      // Messages
      case 'getConversations': result = getConversations(p, session); break;
      case 'getMessages':      result = getMessages(p, session); break;
      case 'sendMessage':      result = sendMessage(p, session); break;
      // Invitations
      case 'createInvite':     result = createInvite(p, session); break;
      // Family bridges (mariage inter-familles)
      case 'createBridge':     result = createBridge(p, session); break;
      case 'confirmBridge':    result = confirmBridge(p, session); break;
      case 'getBridges':       result = getBridges(p, session); break;
      // Vault (Google Drive)
      case 'uploadToVault':    result = uploadToVault(p, session); break;
      case 'getVaultFiles':    result = getVaultFiles(p, session); break;
      case 'deleteVaultFile':  result = deleteVaultFile(p, session); break;
      // Premium
      case 'upgradeUser':      result = upgradeUser(p, session); break;
      case 'submitPayment':    result = submitPayment(p, session); break;
      // Session
      case 'logout':           result = logout(p, session); break;
      default: result = { success: false, error: 'Action inconnue: ' + action };
    }
  } catch(err) {
    result = { success: false, error: err.toString() };
  }

  return jsonOut(result);
}

// ─────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────

function createSession(userId) {
  var sheet = getSheet('Sessions');
  var sessionId = uid();
  var now = new Date();
  var expires = addDays(now, SESSION_DURATION_DAYS);
  sheet.appendRow([sessionId, userId, now, expires]);
  return sessionId;
}

function validateSession(sessionId) {
  if (!sessionId) return { valid: false };
  var data = getSheet('Sessions').getDataRange().getValues();
  var now = new Date();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      var expires = new Date(data[i][3]);
      if (now < expires) {
        return { valid: true, userId: data[i][1] };
      }
      return { valid: false };
    }
  }
  return { valid: false };
}

function logout(p, session) {
  var sheet = getSheet('Sessions');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.sessionId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: true };
}

function deleteAccount(p, session) {
  if (!session || !session.userId) return { success: false, error: 'Non autorisé' };
  
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][3] === session.userId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Compte introuvable' };
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

function requestPasswordReset(p) {
  if (!p.email) return { success: false, error: 'Email manquant' };
  
  // Verify if user exists
  var data = getSheet('Users').getDataRange().getValues();
  var exists = false;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.email) {
      exists = true; break;
    }
  }
  if (!exists) return { success: false, error: 'Cet email n\'existe pas' };

  var otp = Math.floor(100000 + Math.random() * 900000).toString();
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('ResetTokens');
  if (!sheet) {
    sheet = ss.insertSheet('ResetTokens');
    sheet.appendRow(['email', 'otp', 'expiresAt']);
  }
  
  var expires = addDays(new Date(), 1); // expire dans 1 jour
  sheet.appendRow([p.email, otp, expires]);

  try {
    MailApp.sendEmail({
      to: p.email,
      subject: "Confamily — Réinitialisation de votre mot de passe",
      htmlBody: "<p>Bonjour,</p><p>Suite à votre demande, voici votre code de réinitialisation de mot de passe :</p><h2>" + otp + "</h2><p>Ce code expire dans 24 heures.</p><p>L'équipe Confamily</p>"
    });
    return { success: true };
  } catch(e) {
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email : ' + e.toString() };
  }
}

function resetPassword(p) {
  if (!p.email || !p.otp || !p.newPassword) return { success: false, error: 'Paramètres manquants' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheetInfo = ss.getSheetByName('ResetTokens');
  if (!sheetInfo) return { success: false, error: 'Aucune demande enregistrée' };

  var data = sheetInfo.getDataRange().getValues();
  var validIndex = -1;
  var now = new Date();

  // Find valid OTP (latest match)
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === p.email && data[i][1].toString() === p.otp) {
      var expires = new Date(data[i][2]);
      if (now < expires) {
        validIndex = i;
        break;
      }
    }
  }

  if (validIndex === -1) return { success: false, error: 'Code invalide ou expiré' };

  // Update password
  var uSheet = getSheet('Users');
  var uData = uSheet.getDataRange().getValues();
  var changed = false;
  for (var j = 1; j < uData.length; j++) {
    if (uData[j][0] === p.email) {
      uSheet.getRange(j + 1, 2).setValue(hashPassword(p.newPassword));
      changed = true;
      break;
    }
  }

  if (changed) {
    // Nettoyer tous les codes de cet email
    for (var k = data.length - 1; k >= 1; k--) {
      if (data[k][0] === p.email) sheetInfo.deleteRow(k + 1);
    }
    return { success: true };
  }
  return { success: false, error: 'Utilisateur introuvable lors de la mise à jour' };
}

function registerUser(p) {
  if (!p.email || !p.password || !p.name) {
    return { success: false, error: 'Champs requis manquants (email, password, name)' };
  }

  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();

  // Check email duplication
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.email) return { success: false, error: 'Cet email est déjà utilisé' };
  }

  var userId = uid();
  var treeId = uid();
  var pwdHash = hashPassword(p.password);
  var now = new Date();

  sheet.appendRow([p.email, pwdHash, p.name, userId, treeId, false, now]);

  // If the user was invited → link to existing member + keep the inviter's treeId
  if (p.inviteCode) {
    var inviteResult = consumeInvite(p.inviteCode, userId);
    if (inviteResult.success) {
      treeId = inviteResult.treeId;
      // Update treeId on the user row just added
      var newData = sheet.getDataRange().getValues();
      for (var j = 1; j < newData.length; j++) {
        if (newData[j][3] === userId) {
          sheet.getRange(j + 1, 5).setValue(treeId);
          break;
        }
      }
    }
  }

  var sessionId = createSession(userId);
  return {
    success: true,
    sessionId: sessionId,
    user: { id: userId, email: p.email, name: p.name, treeId: treeId, isPremium: false }
  };
}

function loginUser(p) {
  if (!p.email || !p.password) return { success: false, error: 'Email et mot de passe requis' };

  var data = getSheet('Users').getDataRange().getValues();
  var hash = hashPassword(p.password);

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.email && data[i][1] === hash) {
      var userId = data[i][3];
      var sessionId = createSession(userId);
      return {
        success: true,
        sessionId: sessionId,
        user: {
          id: userId, email: data[i][0], name: data[i][2],
          treeId: data[i][4], isPremium: !!data[i][5]
        }
      };
    }
  }
  return { success: false, error: 'Email ou mot de passe incorrect' };
}

// ─────────────────────────────────────────────
// TREE — MEMBERS & RELATIONS
// ─────────────────────────────────────────────

function getUserTreeId(userId) {
  var data = getSheet('Users').getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][3] === userId) return data[i][4];
  }
  return null;
}

function getTree(p, session) {
  var treeId = getUserTreeId(session.userId);
  if (!treeId) return { success: false, error: 'Arbre introuvable' };

  var mData = getSheet('Members').getDataRange().getValues();
  var rData = getSheet('Relations').getDataRange().getValues();
  var members = [];
  var relations = [];

  for (var i = 1; i < mData.length; i++) {
    if (mData[i][0] === treeId) {
      members.push({
        id: mData[i][1], firstName: mData[i][2], lastName: mData[i][3],
        birthDate: mData[i][4], location: mData[i][5], profession: mData[i][6],
        photoUrl: mData[i][7], relation: mData[i][8], gender: mData[i][9],
        isAlive: mData[i][10] !== false, linkedUserId: mData[i][11]
      });
    }
  }

  for (var j = 1; j < rData.length; j++) {
    if (rData[j][0] === treeId) {
      relations.push({ fromId: rData[j][1], toId: rData[j][2], type: rData[j][3] });
    }
  }

  // Include bridge nodes (cross-family orphan nodes visible in this tree)
  var bridges = getBridgeNodesForTree(treeId);

  return { success: true, treeId: treeId, members: members, relations: relations, bridges: bridges };
}

function addMember(p, session) {
  var treeId = getUserTreeId(session.userId);
  if (!treeId) return { success: false, error: 'Arbre introuvable' };

  var sheet = getSheet('Members');
  var memberId = uid();
  var now = new Date();
  sheet.appendRow([
    treeId, memberId, p.firstName || '', p.lastName || '',
    p.birthDate || '', p.location || '', p.profession || '',
    p.photoUrl || '', p.relation || '', p.gender || '', true, '', now
  ]);

  // Add relation if parentId or relType provided
  if (p.refId && p.relType) {
    if (p.relation === 'parent') {
      // The new member is the parent, so they are the fromId
      addRelationRow(treeId, memberId, p.refId, p.relType);
    } else {
      // The new member is the child/spouse/sibling
      addRelationRow(treeId, p.refId, memberId, p.relType);
    }
  }

  return { success: true, memberId: memberId };
}

function updateMember(p, session) {
  var treeId = getUserTreeId(session.userId);
  var sheet = getSheet('Members');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === treeId && data[i][1] === p.memberId) {
      var row = i + 1;
      if (p.firstName)   sheet.getRange(row, 3).setValue(p.firstName);
      if (p.lastName)    sheet.getRange(row, 4).setValue(p.lastName);
      if (p.birthDate)   sheet.getRange(row, 5).setValue(p.birthDate);
      if (p.location)    sheet.getRange(row, 6).setValue(p.location);
      if (p.profession)  sheet.getRange(row, 7).setValue(p.profession);
      if (p.photoUrl)    sheet.getRange(row, 8).setValue(p.photoUrl);
      if (p.isAlive !== undefined) sheet.getRange(row, 11).setValue(p.isAlive === 'true' || p.isAlive === true);
      return { success: true };
    }
  }
  return { success: false, error: 'Membre introuvable dans cet arbre' };
}

function removeMember(p, session) {
  var treeId = getUserTreeId(session.userId);
  var sheet = getSheet('Members');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === treeId && data[i][1] === p.memberId) {
      sheet.deleteRow(i + 1);
      // Also remove their relations
      removeRelationsForMember(treeId, p.memberId);
      return { success: true };
    }
  }
  return { success: false, error: 'Membre introuvable' };
}

function addRelationRow(treeId, fromId, toId, type) {
  getSheet('Relations').appendRow([treeId, fromId, toId, type, new Date()]);
}

function addRelation(p, session) {
  var treeId = getUserTreeId(session.userId);
  addRelationRow(treeId, p.fromId, p.toId, p.type);
  return { success: true };
}

function removeRelation(p, session) {
  var treeId = getUserTreeId(session.userId);
  var sheet = getSheet('Relations');
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === treeId && data[i][1] === p.fromId && data[i][2] === p.toId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Relation introuvable' };
}

function removeRelationsForMember(treeId, memberId) {
  var sheet = getSheet('Relations');
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === treeId && (data[i][1] === memberId || data[i][2] === memberId)) {
      sheet.deleteRow(i + 1);
    }
  }
}

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

function getConversations(p, session) {
  var treeId = getUserTreeId(session.userId);
  var data = getSheet('Messages').getDataRange().getValues();
  var seen = {};
  var convos = [];
  var userId = session.userId;

  for (var i = 1; i < data.length; i++) {
    var from = data[i][1], to = data[i][2], content = data[i][3], grp = data[i][4];
    var key = grp || (from === userId ? to : (to === userId ? from : null));
    if (!key) continue;
    if (!seen[key]) {
      seen[key] = true;
      convos.push({ contactId: key, lastMessage: content, isGroup: !!grp, timestamp: data[i][6] });
    }
  }
  return { success: true, conversations: convos };
}

function getMessages(p, session) {
  var userId = session.userId;
  var data = getSheet('Messages').getDataRange().getValues();
  var msgs = [];

  for (var i = 1; i < data.length; i++) {
    var from = data[i][1], to = data[i][2], grp = data[i][4];
    var match = grp && grp === p.groupId;
    if (!match) match = (!grp && ((from === userId && to === p.contactId) || (from === p.contactId && to === userId)));
    if (match) {
      msgs.push({ id: data[i][0], fromId: from, toId: to, content: data[i][3], groupId: grp, timestamp: data[i][6] });
    }
  }
  return { success: true, messages: msgs };
}

function sendMessage(p, session) {
  var treeId = getUserTreeId(session.userId);
  var msgId = uid();
  getSheet('Messages').appendRow([msgId, session.userId, p.toId, p.content, p.groupId || '', treeId, new Date()]);
  return { success: true, msgId: msgId };
}

// ─────────────────────────────────────────────
// INVITATIONS
// ─────────────────────────────────────────────

function createInvite(p, session) {
  var treeId = getUserTreeId(session.userId);
  var code = shortCode();
  var now = new Date();
  var expires = addDays(now, INVITE_DURATION_DAYS);
  getSheet('Invites').appendRow([code, treeId, p.memberId || '', session.userId, expires, '']);
  // Build invite URL
  var inviteUrl = ScriptApp.getService().getUrl().replace('/exec', '') + '/../../../Confamily/#/register?invite=' + code;
  return { success: true, code: code, expiresAt: expires };
}

function resolveInvite(p) {
  if (!p.code) return { success: false, error: 'Code manquant' };
  var data = getSheet('Invites').getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.code) {
      if (data[i][5]) return { success: false, error: 'Cette invitation a déjà été utilisée' };
      var expires = new Date(data[i][4]);
      if (now > expires) return { success: false, error: 'Cette invitation a expiré' };

      // Fetch pre-fill data from the member node
      var memberId = data[i][2];
      var treeId = data[i][1];
      var prefill = {};
      if (memberId) {
        var mData = getSheet('Members').getDataRange().getValues();
        for (var j = 1; j < mData.length; j++) {
          if (mData[j][1] === memberId) {
            prefill = { firstName: mData[j][2], lastName: mData[j][3], relation: mData[j][8], gender: mData[j][9] };
            break;
          }
        }
      }
      return { success: true, treeId: treeId, memberId: memberId, prefill: prefill };
    }
  }
  return { success: false, error: 'Code d\'invitation invalide' };
}

function consumeInvite(code, userId) {
  var sheet = getSheet('Invites');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === code && !data[i][5]) {
      sheet.getRange(i + 1, 6).setValue(new Date());
      // Link member to user
      var memberId = data[i][2];
      var treeId = data[i][1];
      if (memberId) {
        var mSheet = getSheet('Members');
        var mData = mSheet.getDataRange().getValues();
        for (var j = 1; j < mData.length; j++) {
          if (mData[j][1] === memberId) {
            mSheet.getRange(j + 1, 12).setValue(userId);
            break;
          }
        }
      }
      return { success: true, treeId: treeId, memberId: memberId };
    }
  }
  return { success: false };
}

// ─────────────────────────────────────────────
// TREE BRIDGES (mariages inter-familles)
// ─────────────────────────────────────────────

function createBridge(p, session) {
  // p.member1Id = nœud dans mon arbre, p.member2Id + p.tree2Id = nœud dans l'autre famille
  var treeId = getUserTreeId(session.userId);
  var bridgeId = uid();
  getSheet('TreeBridges').appendRow([bridgeId, treeId, p.member1Id, p.tree2Id, p.member2Id, 'pending', new Date()]);
  return { success: true, bridgeId: bridgeId };
}

function confirmBridge(p, session) {
  var treeId = getUserTreeId(session.userId);
  var sheet = getSheet('TreeBridges');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.bridgeId && (data[i][1] === treeId || data[i][3] === treeId)) {
      sheet.getRange(i + 1, 6).setValue('active');
      return { success: true };
    }
  }
  return { success: false, error: 'Bridge introuvable ou accès refusé' };
}

function getBridges(p, session) {
  var treeId = getUserTreeId(session.userId);
  var data = getSheet('TreeBridges').getDataRange().getValues();
  var results = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === treeId || data[i][3] === treeId) {
      results.push({
        bridgeId: data[i][0], tree1Id: data[i][1], member1Id: data[i][2],
        tree2Id: data[i][3], member2Id: data[i][4], status: data[i][5]
      });
    }
  }
  return { success: true, bridges: results };
}

function getBridgeNodesForTree(treeId) {
  // Returns the "ghost" nodes from other trees that are linked via an active bridge
  var data = getSheet('TreeBridges').getDataRange().getValues();
  var mData = getSheet('Members').getDataRange().getValues();
  var nodes = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][5] !== 'active') continue;
    var foreignTreeId, foreignMemberId, localMemberId;

    if (data[i][1] === treeId) {
      foreignTreeId = data[i][3]; foreignMemberId = data[i][4]; localMemberId = data[i][2];
    } else if (data[i][3] === treeId) {
      foreignTreeId = data[i][1]; foreignMemberId = data[i][2]; localMemberId = data[i][4];
    } else continue;

    // Fetch foreign member data
    for (var j = 1; j < mData.length; j++) {
      if (mData[j][0] === foreignTreeId && mData[j][1] === foreignMemberId) {
        nodes.push({
          memberId: foreignMemberId, firstName: mData[j][2], lastName: mData[j][3],
          photoUrl: mData[j][7], relation: mData[j][8], gender: mData[j][9],
          fromTreeId: foreignTreeId, linkedToLocalMember: localMemberId,
          isBridge: true // flag for front-end rendering
        });
        break;
      }
    }
  }
  return nodes;
}

// ─────────────────────────────────────────────
// VAULT — GOOGLE DRIVE
// ─────────────────────────────────────────────

function getOrCreateVaultFolder(userId) {
  var folderName = 'Confamily_Vault_' + userId;
  var iter = DriveApp.getFoldersByName(folderName);
  return iter.hasNext() ? iter.next() : DriveApp.createFolder(folderName);
}

function uploadToVault(p, session) {
  try {
    var folder = getOrCreateVaultFolder(session.userId);
    var mimeType = p.mimeType || 'application/octet-stream';
    var blob = Utilities.newBlob(Utilities.base64Decode(p.fileData), mimeType, p.fileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return { success: true, fileId: file.getId(), url: file.getUrl(), name: file.getName(), size: file.getSize() };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

function getVaultFiles(p, session) {
  try {
    var folder = getOrCreateVaultFolder(session.userId);
    var files = folder.getFiles();
    var result = [];
    while (files.hasNext()) {
      var f = files.next();
      result.push({ fileId: f.getId(), name: f.getName(), url: f.getUrl(), size: f.getSize(), date: f.getDateCreated(), mimeType: f.getMimeType() });
    }
    return { success: true, files: result };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

function deleteVaultFile(p, session) {
  try {
    var file = DriveApp.getFileById(p.fileId);
    // Security: ensure the file is in this user's vault folder
    var parents = file.getParents();
    var expectedName = 'Confamily_Vault_' + session.userId;
    while (parents.hasNext()) {
      if (parents.next().getName() === expectedName) {
        file.setTrashed(true);
        return { success: true };
      }
    }
    return { success: false, error: 'Accès refusé : ce fichier ne vous appartient pas' };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

// ─────────────────────────────────────────────
// PREMIUM
// ─────────────────────────────────────────────

function upgradeUser(p, session) {
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][3] === session.userId) {
      sheet.getRange(i + 1, 6).setValue(true);
      return { success: true };
    }
  }
  return { success: false, error: 'Utilisateur introuvable' };
}

function submitPayment(p, session) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName('Payments');
    if (!sheet) {
      sheet = ss.insertSheet('Payments');
      sheet.appendRow(['userId', 'method', 'transactionId', 'date']);
    }
    sheet.appendRow([session.userId, p.method, p.transactionId, new Date()]);
    return upgradeUser(p, session);
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

// ─────────────────────────────────────────────
// AUTOMATED BACKUPS
// ─────────────────────────────────────────────

/**
 * Lancez cette fonction manuellement UNE SEULE FOIS depuis l'interface Google Apps Script
 * pour activer les sauvegardes automatiques hebdomadaires.
 */
function setupWeeklyBackup() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'weeklyBackup') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  ScriptApp.newTrigger('weeklyBackup')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(3) // 3h du matin
    .create();
}

function weeklyBackup() {
  try {
    var folderName = 'Confamily_Backups';
    var iter = DriveApp.getFoldersByName(folderName);
    var folder = iter.hasNext() ? iter.next() : DriveApp.createFolder(folderName);
    
    var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    var backupName = "Confamily_DB_Backup_" + dateStr;
    
    var file = DriveApp.getFileById(SHEET_ID);
    file.makeCopy(backupName, folder);
  } catch(e) {
    console.error("Backup failed: " + e.toString());
  }
}
