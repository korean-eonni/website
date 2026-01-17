import { google } from 'googleapis'

const SPREADSHEET_ID = '1rm5beP1P_eCIshYdaJBoyUm3EiOB8Ox3UssMhPv6K1I'
const SHEET_NAME = 'Загальний'

// Product data to update - mapping product name to its data
const productData: Record<string, {
  tags: string
  shortDesc: string
  longDesc: string
  age: string
  ingredients: string
  skinType: string
  series: string
  classification: string
}> = {
  "PDRN Pink Collagen Capsule Cream": {
    tags: "PDRN, колаген, капсульний крем, зволоження, антивіковий, пружність шкіри, відновлення, корейська косметика",
    shortDesc: "Капсульний крем з PDRN та колагеном для глибокого зволоження та відновлення пружності шкіри.",
    longDesc: "PDRN Pink Collagen Capsule Cream — це інноваційний капсульний крем, який поєднує силу рослинного PDRN з потрійним колагеном для максимального ефекту омолодження. Крем стимулює синтез власного колагену, підвищує пружність та еластичність шкіри, розгладжує дрібні зморшки.",
    age: "18+",
    ingredients: "Рослинний PDRN, потрійний колаген, церамідний комплекс, ніацинамід, гіалуронова кислота",
    skinType: "Всі типи",
    series: "PDRN Pink",
    classification: "Натуральна"
  },
  "PDRN Essence": {
    tags: "PDRN, есенція, зволоження, антивіковий, регенерація, пружність, корейська косметика, сяйво шкіри",
    shortDesc: "Концентрована есенція з 100 000 ppm рослинного PDRN для інтенсивного відновлення та омолодження.",
    longDesc: "PDRN Essence — високоефективна есенція з концентрацією 100 000 ppm рослинного PDRN з дикого женьшеню. Стимулює природну регенерацію клітин, підвищує вироблення колагену та еластину, повертає шкірі пружність та здорове сяйво.",
    age: "18+",
    ingredients: "Рослинний PDRN 100 000 ppm, 5 видів церамідів, ніацинамід, пантенол, сквалан",
    skinType: "Всі типи",
    series: "PDRN",
    classification: "Натуральна"
  },
  "Exosome Cica Cream": {
    tags: "екзосоми, центела, заспокійливий, відновлення, чутлива шкіра, бар'єр шкіри, корейська косметика",
    shortDesc: "Заспокійливий крем з екзосомами та центелою для відновлення пошкодженої та чутливої шкіри.",
    longDesc: "Exosome Cica Cream — це інноваційний заспокійливий крем, який поєднує технологію екзосом з екстрактом центели азіатської. Екзосоми доставляють активні компоненти безпосередньо в клітини шкіри, а центела заспокоює подразнення та прискорює загоєння.",
    age: "16+",
    ingredients: "Екзосоми, мадекасосид, азіатикозид, пантенол, алантоїн, бетаїн",
    skinType: "Чутлива",
    series: "Exosome Cica",
    classification: "Натуральна"
  },
  "Deep Vita C Capsule Serum": {
    tags: "вітамін С, освітлення, антиоксидант, пігментація, сяйво, капсульна сироватка, корейська косметика",
    shortDesc: "Потужна сироватка з вітаміном С у капсулах для освітлення шкіри та боротьби з пігментацією.",
    longDesc: "Deep Vita C Capsule Serum — це високоефективна сироватка з концентрованим вітаміном С у захищених капсулах. Вітамін С — потужний антиоксидант, який освітлює пігментні плями, вирівнює тон шкіри та стимулює вироблення колагену.",
    age: "18+",
    ingredients: "Вітамін С (аскорбінова кислота), ніацинамід, гіалуронова кислота, екстракт зеленого чаю",
    skinType: "Всі типи",
    series: "Deep Vita C",
    classification: "Натуральна"
  },
  "Zero Pore Serum 2.0": {
    tags: "звуження пор, себоконтроль, матування, жирна шкіра, BHA, салицилова кислота, корейська косметика",
    shortDesc: "Сироватка для звуження пор та контролю жирного блиску. Оновлена формула 2.0.",
    longDesc: "Zero Pore Serum 2.0 — це вдосконалена формула для тих, хто бореться з розширеними порами та надмірним виділенням себуну. BHA проникає в пори, розчиняє забруднення та запобігає появі чорних цяток.",
    age: "16+",
    ingredients: "Салицилова кислота (BHA), ніацинамід, цинк PCA, гіалуронова кислота",
    skinType: "Жирна/Комбінована",
    series: "Zero Pore",
    classification: "Лікувальна"
  }
}

async function getAuthClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Missing Google credentials')
  }

  // Normalize private key
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n')
  }
  if (!privateKey.includes('-----BEGIN')) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return auth
}

async function updateSheetData() {
  const auth = await getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })

  // First, get all existing data to find product rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:AK`,
  })

  const rows = response.data.values || []
  const headers = rows[0] || []
  
  console.log('Headers:', headers)
  console.log('Total rows:', rows.length)

  // Find column indices
  const nameCol = headers.indexOf('Назва')
  const tagsCol = headers.indexOf('Теги (через кому)')
  const shortDescCol = headers.indexOf('Короткий опис')
  const longDescCol = headers.indexOf('Довгий опис')

  console.log('Column indices:', { nameCol, tagsCol, shortDescCol, longDescCol })

  // Prepare batch update
  const updates: { range: string; values: string[][] }[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const productName = row[nameCol]?.trim()
    
    if (productName && productData[productName]) {
      const data = productData[productName]
      const rowNum = i + 1 // 1-indexed for sheets

      // Update tags (column N = index 13)
      if (tagsCol >= 0) {
        updates.push({
          range: `${SHEET_NAME}!N${rowNum}`,
          values: [[data.tags]]
        })
      }

      // Update short description (column O = index 14)
      if (shortDescCol >= 0) {
        updates.push({
          range: `${SHEET_NAME}!O${rowNum}`,
          values: [[data.shortDesc]]
        })
      }

      // Update long description (column P = index 15)
      if (longDescCol >= 0) {
        updates.push({
          range: `${SHEET_NAME}!P${rowNum}`,
          values: [[data.longDesc]]
        })
      }

      console.log(`Will update row ${rowNum}: ${productName}`)
    }
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    })
    console.log(`Updated ${updates.length} cells`)
  } else {
    console.log('No updates to make')
  }
}

updateSheetData().catch(console.error)

