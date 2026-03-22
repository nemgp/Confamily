// =============================================
// Confamily — Google Apps Script Backend
// =============================================
// INSTRUCTIONS :
// 1. Ouvrez Google Sheets et créez un classeur nommé "Confamily_DB"
// 2. Créez 3 feuilles : "Users", "Members", "Messages"
// 3. Ouvrez Extensions → Apps Script
// 4. Collez ce code dans Code.gs
// 5. Déployez en tant que Web App (Exécuter en tant que : Moi, Accès : Tout le monde)
// 6. Copiez l'URL de déploiement et collez-la dans src/api/googleAPI.ts
// =============================================

const SHEET_ID = 'VOTRE_SHEET_ID_ICI'; // Remplacez par l'ID de votre Google Sheet

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const action = e.parameter.action;
  let result;
  
  try {
    switch(action) {
      case 'register': result = registerUser(e.parameter); break;
      case 'login': result = loginUser(e.parameter); break;
      case 'getMembers': result = getMembers(e.parameter); break;
      case 'addMember': result = addMember(e.parameter); break;
      case 'updateMember': result = updateMember(e.parameter); break;
      case 'getMessages': result = getMessages(e.parameter); break;
      case 'sendMessage': result = sendMessage(e.parameter); break;
      case 'getConversations': result = getConversations(e.parameter); break;
      case 'upgradeUser': result = upgradeUser(e.parameter); break;
      case 'getVaultFiles': result = getVaultFiles(e.parameter); break;
      case 'uploadToVault': result = uploadToVault(e.parameter); break;
      default: result = { success: false, error: 'Unknown action' };
    }
  } catch(err) {
    result = { success: false, error: err.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== AUTH =====
function registerUser(p) {
  const sheet = getSheet('Users');
  const data = sheet.getDataRange().getValues();
  
  // Check if email already exists
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.email) return { success: false, error: 'Email déjà utilisé' };
  }
  
  const id = 'user_' + Date.now();
  const treeId = 'tree_' + Date.now();
  sheet.appendRow([p.email, p.password, p.name, id, treeId, false, new Date()]);
  
  return { success: true, user: { id: id, email: p.email, name: p.name, treeId: treeId, isPremium: false } };
}

function loginUser(p) {
  const data = getSheet('Users').getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.email && data[i][1] === p.password) {
      return { success: true, user: { id: data[i][3], email: data[i][0], name: data[i][2], treeId: data[i][4], isPremium: data[i][5] } };
    }
  }
  return { success: false, error: 'Email ou mot de passe incorrect' };
}

// ===== MEMBERS =====
function getMembers(p) {
  const data = getSheet('Members').getDataRange().getValues();
  const headers = data[0];
  const members = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === p.treeId) {
      const m = {};
      for (var j = 0; j < headers.length; j++) m[headers[j]] = data[i][j];
      members.push(m);
    }
  }
  return { success: true, members: members };
}

function addMember(p) {
  const sheet = getSheet('Members');
  const id = 'member_' + Date.now();
  sheet.appendRow([p.treeId, id, p.firstName, p.lastName, p.birthDate || '', p.location || '', p.profession || '', p.photoUrl || '', p.relation || '', p.gender || '', p.parentId || '', new Date()]);
  return { success: true, id: id };
}

function updateMember(p) {
  const sheet = getSheet('Members');
  const data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === p.memberId) {
      if (p.firstName) sheet.getRange(i+1, 3).setValue(p.firstName);
      if (p.lastName) sheet.getRange(i+1, 4).setValue(p.lastName);
      if (p.birthDate) sheet.getRange(i+1, 5).setValue(p.birthDate);
      if (p.location) sheet.getRange(i+1, 6).setValue(p.location);
      if (p.profession) sheet.getRange(i+1, 7).setValue(p.profession);
      return { success: true };
    }
  }
  return { success: false, error: 'Membre non trouvé' };
}

// ===== MESSAGES =====
function getMessages(p) {
  const data = getSheet('Messages').getDataRange().getValues();
  const msgs = [];
  for (var i = 1; i < data.length; i++) {
    if ((data[i][1] === p.userId && data[i][2] === p.contactId) || (data[i][1] === p.contactId && data[i][2] === p.userId)) {
      msgs.push({ id: data[i][0], fromId: data[i][1], toId: data[i][2], content: data[i][3], groupId: data[i][4], timestamp: data[i][5] });
    }
  }
  return { success: true, messages: msgs };
}

function sendMessage(p) {
  const sheet = getSheet('Messages');
  const id = 'msg_' + Date.now();
  sheet.appendRow([id, p.fromId, p.toId, p.content, p.groupId || '', new Date()]);
  return { success: true, id: id };
}

function getConversations(p) {
  const data = getSheet('Messages').getDataRange().getValues();
  const contacts = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === p.userId) contacts[data[i][2]] = data[i][3];
    if (data[i][2] === p.userId) contacts[data[i][1]] = data[i][3];
  }
  return { success: true, conversations: contacts };
}

// ===== PREMIUM =====
function upgradeUser(p) {
  const sheet = getSheet('Users');
  const data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][3] === p.userId) {
      sheet.getRange(i+1, 6).setValue(true);
      return { success: true };
    }
  }
  return { success: false, error: 'Utilisateur non trouvé' };
}

// ===== VAULT (Google Drive) =====
function uploadToVault(p) {
  try {
    var folder = DriveApp.getFoldersByName('Confamily_Vault_' + p.userId);
    var targetFolder;
    if (folder.hasNext()) {
      targetFolder = folder.next();
    } else {
      targetFolder = DriveApp.createFolder('Confamily_Vault_' + p.userId);
    }
    
    var blob = Utilities.newBlob(Utilities.base64Decode(p.fileData), 'application/octet-stream', p.fileName);
    var file = targetFolder.createFile(blob);
    return { success: true, fileId: file.getId(), url: file.getUrl() };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

function getVaultFiles(p) {
  try {
    var folder = DriveApp.getFoldersByName('Confamily_Vault_' + p.userId);
    if (!folder.hasNext()) return { success: true, files: [] };
    var files = folder.next().getFiles();
    var result = [];
    while (files.hasNext()) {
      var f = files.next();
      result.push({ name: f.getName(), url: f.getUrl(), size: f.getSize(), date: f.getDateCreated() });
    }
    return { success: true, files: result };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}
