# Google 스프레드시트 설정 가이드

## 1. 스프레드시트 시트 구조

스프레드시트에 다음 3개의 시트를 만들어주세요:

### 시트 1: `gifts` (선물 내역)
| 컬럼명 | 설명 |
|--------|------|
| id | 고유 ID |
| code | 코인 코드 (예: XXXX-XXXX-XXXX) |
| amount | 금액 |
| senderName | 보내는 사람 이름 |
| senderPhone | 보내는 사람 연락처 |
| senderEmail | 보내는 사람 이메일 |
| receiverName | 받는 사람 이름 |
| receiverPhone | 받는 사람 연락처 |
| receiverEmail | 받는 사람 이메일 |
| message | 메시지 |
| status | 상태 (pending/paid/registered/refunded/expired) |
| paymentId | 결제 ID |
| thankYouMessage | 땡큐레터 메시지 |
| createdAt | 생성일시 |
| expiresAt | 만료일시 |
| registeredAt | 등록일시 |

### 시트 2: `conversations` (대화)
| 컬럼명 | 설명 |
|--------|------|
| id | 고유 ID |
| userName | 사용자 이름 |
| userEmail | 사용자 이메일 |
| status | 상태 (open/closed) |
| lastMessage | 마지막 메시지 |
| lastMessageAt | 마지막 메시지 시간 |
| createdAt | 생성일시 |

### 시트 3: `messages` (메시지)
| 컬럼명 | 설명 |
|--------|------|
| id | 고유 ID |
| conversationId | 대화 ID |
| senderType | 발신자 유형 (user/admin) |
| content | 메시지 내용 |
| createdAt | 생성일시 |

## 2. Google Apps Script 설정

1. 스프레드시트에서 **확장 프로그램 > Apps Script** 클릭
2. 기존 코드를 삭제하고 `google-apps-script.js` 파일의 내용을 붙여넣기
3. **배포 > 새 배포** 클릭
4. 유형: **웹 앱** 선택
5. 다음 사용자 인증 정보로 실행: **나**
6. 액세스 권한: **모든 사용자**
7. **배포** 클릭 후 URL 복사

## 3. 환경 변수 설정

`.env.local` 파일에 복사한 URL 추가:

```
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## 4. 스프레드시트 첫 행 설정

각 시트의 첫 번째 행에 컬럼명을 입력해주세요:

### gifts 시트 첫 행:
```
id | code | amount | senderName | senderPhone | senderEmail | receiverName | receiverPhone | receiverEmail | message | status | paymentId | thankYouMessage | createdAt | expiresAt | registeredAt
```

### conversations 시트 첫 행:
```
id | userName | userEmail | status | lastMessage | lastMessageAt | createdAt
```

### messages 시트 첫 행:
```
id | conversationId | senderType | content | createdAt
```
