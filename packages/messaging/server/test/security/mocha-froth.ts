/// =========================================================
/// Mostly copied from https://github.com/keith24/mocha-froth
/// =========================================================

export interface Options {
  none?: boolean // Empty string
  whitespace?: boolean // Various whitespace chars
  quotes?: boolean // Combinations of quotes
  backslashing?: boolean // Combinations of backslashes
  symbols?: boolean // Various symbols
  foreign?: boolean // Foreign chars
  alphanumeric?: boolean // Ordinary letters and numbers
}

/**
 * Returns a random string for fuzzing
 */
export default function (
  max = 20,
  min = max,
  opt: Options = {
    // Set to true to include tests with...
    none: false, // Empty string
    whitespace: true, // Various whitespace chars
    quotes: true, // Combinations of quotes
    backslashing: true, // Combinations of backslashes
    symbols: true, // Various symbols
    foreign: true, // Foreign chars
    alphanumeric: true // Ordinary letters and numbers
  }
) {
  let chars: string[] = []

  // Whitespace characters
  if (opt.whitespace !== false) {
    chars = chars.concat([
      ' ', // Space
      '  ', // Tab
      '\n', // Newline
      '\r', // Return
      '\r\n' // Carrage return
    ])
  }

  // Quotation characters
  if (opt.quotes !== false) {
    chars = chars.concat([
      "'",
      "''",
      "'''", // Single quotes
      '"',
      '""',
      '"""', // Double quotes
      '`',
      '``',
      '```' // Backticks
    ])
  }

  // Backslashes
  if (opt.backslashing !== false) {
    chars = chars.concat(['\\', '\\\\'])
  }

  // Symbols
  if (opt.symbols !== false) {
    chars = chars.concat('°~!@#$%€^&*()-_─=+[]{}|;:,./<>?¿¹²³¼½¬€¶←↓→»«¢„“”·…–'.split(''))
  }

  // Foreign characters
  if (opt.foreign !== false) {
    chars = chars.concat(
      'ŧłßöäüñáóíúýéâêîôûŷàèìòùảẻỉỏỷÿïøþłĸŋđðſæµёйцукенгшщзхъэждлорпавыфячсмитьбюЁЙЦУКЕНГШЩЗХЪЭЖДЛОРПАВЫФЯЧСМИТЬБЮ'.split(
        ''
      )
    )
  }

  // Ordinary letters and numbers
  if (opt.alphanumeric !== false) {
    chars = chars.concat('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''))
  }

  // Set minimum string length
  min = opt.none !== false ? 0 : min

  // Pick a random number from min to max
  const len = Math.floor(Math.random() * (max - min + 1)) + min

  // Create a string of that length
  let s = ''
  while (s.length < len) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }

  // Make sure we didn't go over the max length
  // (some chars have multiple characters)
  while (s.length > len) {
    s = s.substring(1)
  }

  return s
}
