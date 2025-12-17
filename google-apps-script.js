/**
 * Google Apps Script - 스클코인 선물 서비스 API
 *
 * 이 코드를 스프레드시트의 Apps Script에 붙여넣고 웹 앱으로 배포하세요.
 * 배포 URL을 .env.local의 GOOGLE_SCRIPT_URL에 설정하세요.
 */

const SPREADSHEET_ID = '1amMCCizhwSkOwFpQG8iGQCrzLVEZSWM7IksQcWVSgMk';

/**
 * 시트 초기화 함수 - Apps Script 에디터에서 한 번만 실행하세요!
 * 메뉴: 실행 > 함수 실행 > initializeSheets
 */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // gifts 시트
  let giftsSheet = ss.getSheetByName('gifts');
  if (!giftsSheet) {
    giftsSheet = ss.insertSheet('gifts');
  }
  giftsSheet.getRange(1, 1, 1, 16).setValues([[
    'id', 'code', 'amount', 'senderName', 'senderPhone', 'senderEmail',
    'receiverName', 'receiverPhone', 'receiverEmail', 'message', 'status',
    'paymentId', 'thankYouMessage', 'createdAt', 'expiresAt', 'registeredAt'
  ]]);
  giftsSheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#704de4').setFontColor('white');

  // conversations 시트
  let convSheet = ss.getSheetByName('conversations');
  if (!convSheet) {
    convSheet = ss.insertSheet('conversations');
  }
  convSheet.getRange(1, 1, 1, 7).setValues([[
    'id', 'userName', 'userEmail', 'status', 'lastMessage', 'lastMessageAt', 'createdAt'
  ]]);
  convSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#704de4').setFontColor('white');

  // messages 시트
  let msgSheet = ss.getSheetByName('messages');
  if (!msgSheet) {
    msgSheet = ss.insertSheet('messages');
  }
  msgSheet.getRange(1, 1, 1, 5).setValues([[
    'id', 'conversationId', 'senderType', 'content', 'createdAt'
  ]]);
  msgSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#704de4').setFontColor('white');

  // 기본 시트(Sheet1) 삭제 시도
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.getUi().alert('시트 초기화 완료! 이제 웹 앱으로 배포하세요.');
}

// CORS 헤더 설정
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET 요청 처리
function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    switch (action) {
      case 'getGifts':
        return createResponse(getGifts(ss, e.parameter));
      case 'getGift':
        return createResponse(getGift(ss, e.parameter.id));
      case 'getConversations':
        return createResponse(getConversations(ss));
      case 'getMessages':
        return createResponse(getMessages(ss, e.parameter.conversationId));
      case 'getCash':
        return createResponse(getCash(ss, e.parameter));
      default:
        return createResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    return createResponse({ error: error.message });
  }
}

// POST 요청 처리
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    switch (action) {
      case 'createGift':
        return createResponse(createGift(ss, data));
      case 'updateGift':
        return createResponse(updateGift(ss, data));
      case 'registerGift':
        return createResponse(registerGift(ss, data.code));
      case 'createPayment':
        return createResponse(createPayment(ss, data));
      case 'completePayment':
        return createResponse(completePayment(ss, data));
      case 'createConversation':
        return createResponse(createConversation(ss, data));
      case 'sendMessage':
        return createResponse(sendMessage(ss, data));
      default:
        return createResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    return createResponse({ error: error.message });
  }
}

// 선물 코드 생성
function generateGiftCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// UUID 생성
function generateId() {
  return Utilities.getUuid();
}

// 시트 데이터를 객체 배열로 변환
function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  }).filter(obj => obj.id); // id가 있는 행만 반환
}

// 객체를 시트 행으로 변환
function objectToRow(obj, headers) {
  return headers.map(header => obj[header] || '');
}

// ===== GIFTS =====

function getGifts(ss, params) {
  const sheet = ss.getSheetByName('gifts');
  const gifts = sheetToObjects(sheet);

  if (params.admin === 'true') {
    return gifts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (params.phone) {
    return gifts.filter(g => g.senderPhone === params.phone)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (params.email) {
    return gifts.filter(g => g.senderEmail === params.email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return [];
}

function getGift(ss, id) {
  const sheet = ss.getSheetByName('gifts');
  const gifts = sheetToObjects(sheet);

  // ID 또는 코드로 검색
  let gift = gifts.find(g => g.id === id);
  if (!gift) {
    gift = gifts.find(g => g.code === id);
  }

  return gift || { error: '선물을 찾을 수 없습니다.' };
}

function createGift(ss, data) {
  const sheet = ss.getSheetByName('gifts');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const id = generateId();
  const code = generateGiftCode();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const gift = {
    id,
    code,
    amount: data.amount,
    senderName: data.senderName,
    senderPhone: data.senderPhone || '',
    senderEmail: data.senderEmail || '',
    receiverName: data.receiverName,
    receiverPhone: data.receiverPhone || '',
    receiverEmail: data.receiverEmail || '',
    message: data.message || '',
    status: 'pending',
    paymentId: '',
    thankYouMessage: '',
    createdAt: now,
    expiresAt,
    registeredAt: ''
  };

  sheet.appendRow(objectToRow(gift, headers));

  return { id, code, amount: gift.amount, senderName: gift.senderName, receiverName: gift.receiverName, expiresAt };
}

function updateGift(ss, data) {
  const sheet = ss.getSheetByName('gifts');
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIndex = headers.indexOf('id');

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIndex] === data.id) {
      // 업데이트할 필드들
      if (data.status) {
        const statusIndex = headers.indexOf('status');
        sheet.getRange(i + 1, statusIndex + 1).setValue(data.status);
      }
      if (data.thankYouMessage) {
        const thankYouIndex = headers.indexOf('thankYouMessage');
        sheet.getRange(i + 1, thankYouIndex + 1).setValue(data.thankYouMessage);
      }
      if (data.registeredAt) {
        const registeredIndex = headers.indexOf('registeredAt');
        sheet.getRange(i + 1, registeredIndex + 1).setValue(data.registeredAt);
      }
      if (data.paymentId) {
        const paymentIndex = headers.indexOf('paymentId');
        sheet.getRange(i + 1, paymentIndex + 1).setValue(data.paymentId);
      }

      return getGift(ss, data.id);
    }
  }

  return { error: '선물을 찾을 수 없습니다.' };
}

function registerGift(ss, code) {
  const sheet = ss.getSheetByName('gifts');
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const codeIndex = headers.indexOf('code');
  const statusIndex = headers.indexOf('status');
  const registeredAtIndex = headers.indexOf('registeredAt');
  const expiresAtIndex = headers.indexOf('expiresAt');

  // 코드 정리
  const cleanCode = code.replace(/[-\s]/g, '').toUpperCase();
  const formattedCode = cleanCode.match(/.{1,4}/g)?.join('-') || cleanCode;

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][codeIndex] === formattedCode) {
      const status = allData[i][statusIndex];
      const expiresAt = allData[i][expiresAtIndex];

      if (status === 'registered') {
        return { error: '이미 등록된 코인 코드입니다.' };
      }
      if (status === 'refunded') {
        return { error: '환불된 코인 코드입니다.' };
      }
      if (status === 'expired' || new Date(expiresAt) < new Date()) {
        return { error: '만료된 코인 코드입니다.' };
      }
      if (status !== 'paid') {
        return { error: '결제가 완료되지 않은 선물입니다.' };
      }

      // 등록 처리
      sheet.getRange(i + 1, statusIndex + 1).setValue('registered');
      sheet.getRange(i + 1, registeredAtIndex + 1).setValue(new Date().toISOString());

      const amountIndex = headers.indexOf('amount');
      const senderNameIndex = headers.indexOf('senderName');

      return {
        success: true,
        message: '코인이 성공적으로 등록되었습니다!',
        gift: {
          id: allData[i][headers.indexOf('id')],
          amount: allData[i][amountIndex],
          senderName: allData[i][senderNameIndex]
        }
      };
    }
  }

  return { error: '유효하지 않은 코인 코드입니다.' };
}

// ===== PAYMENTS =====

function createPayment(ss, data) {
  // 간단히 gift의 paymentId만 업데이트
  const paymentId = generateId();

  updateGift(ss, {
    id: data.giftId,
    paymentId: paymentId
  });

  return { id: paymentId, giftId: data.giftId, amount: data.amount, status: 'pending' };
}

function completePayment(ss, data) {
  const sheet = ss.getSheetByName('gifts');
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const paymentIdIndex = headers.indexOf('paymentId');
  const statusIndex = headers.indexOf('status');

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][paymentIdIndex] === data.paymentId) {
      sheet.getRange(i + 1, statusIndex + 1).setValue('paid');
      return { success: true, message: '결제가 완료되었습니다.' };
    }
  }

  return { error: '결제를 찾을 수 없습니다.' };
}

// ===== CASH =====

function getCash(ss, params) {
  const sheet = ss.getSheetByName('gifts');
  const gifts = sheetToObjects(sheet);

  const phone = params.phone;
  const email = params.email;

  if (!phone && !email) {
    return { history: [], totalCash: 0 };
  }

  // 환불된 선물을 캐시로 계산
  const refundedGifts = gifts.filter(g => {
    if (g.status !== 'refunded') return false;
    if (phone && g.senderPhone === phone) return true;
    if (email && g.senderEmail === email) return true;
    return false;
  });

  const history = refundedGifts.map(g => ({
    id: g.id,
    amount: g.amount,
    type: 'refund',
    description: '선물 환불',
    createdAt: g.createdAt
  }));

  const totalCash = history.reduce((sum, item) => sum + Number(item.amount), 0);

  return { history, totalCash };
}

// ===== CONVERSATIONS =====

function getConversations(ss) {
  const sheet = ss.getSheetByName('conversations');
  if (!sheet) return [];

  const conversations = sheetToObjects(sheet);
  return conversations.sort((a, b) => {
    // open 상태 먼저, 그 다음 최근 메시지 순
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    return new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt);
  });
}

function createConversation(ss, data) {
  let sheet = ss.getSheetByName('conversations');

  // 시트가 없으면 생성
  if (!sheet) {
    sheet = ss.insertSheet('conversations');
    sheet.appendRow(['id', 'userName', 'userEmail', 'status', 'lastMessage', 'lastMessageAt', 'createdAt']);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const conversations = sheetToObjects(sheet);

  // 이미 열린 대화가 있는지 확인
  const existing = conversations.find(c =>
    c.status === 'open' &&
    (c.userEmail === data.userEmail || c.userName === data.userName)
  );

  if (existing) {
    return existing;
  }

  const id = generateId();
  const now = new Date().toISOString();

  const conversation = {
    id,
    userName: data.userName,
    userEmail: data.userEmail || '',
    status: 'open',
    lastMessage: '',
    lastMessageAt: '',
    createdAt: now
  };

  sheet.appendRow(objectToRow(conversation, headers));

  return conversation;
}

// ===== MESSAGES =====

function getMessages(ss, conversationId) {
  let sheet = ss.getSheetByName('messages');
  if (!sheet) return [];

  const messages = sheetToObjects(sheet);
  return messages
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function sendMessage(ss, data) {
  let sheet = ss.getSheetByName('messages');

  // 시트가 없으면 생성
  if (!sheet) {
    sheet = ss.insertSheet('messages');
    sheet.appendRow(['id', 'conversationId', 'senderType', 'content', 'createdAt']);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const id = generateId();
  const now = new Date().toISOString();

  const message = {
    id,
    conversationId: data.conversationId,
    senderType: data.senderType,
    content: data.content,
    createdAt: now
  };

  sheet.appendRow(objectToRow(message, headers));

  // 대화의 마지막 메시지 업데이트
  const convSheet = ss.getSheetByName('conversations');
  if (convSheet) {
    const convData = convSheet.getDataRange().getValues();
    const convHeaders = convData[0];
    const idIndex = convHeaders.indexOf('id');

    for (let i = 1; i < convData.length; i++) {
      if (convData[i][idIndex] === data.conversationId) {
        const lastMessageIndex = convHeaders.indexOf('lastMessage');
        const lastMessageAtIndex = convHeaders.indexOf('lastMessageAt');
        convSheet.getRange(i + 1, lastMessageIndex + 1).setValue(data.content.substring(0, 100));
        convSheet.getRange(i + 1, lastMessageAtIndex + 1).setValue(now);
        break;
      }
    }
  }

  return message;
}
