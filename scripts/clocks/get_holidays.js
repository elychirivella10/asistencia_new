/**
 * get_holidays.js
 * Helper script: fetches Venezuelan public holidays for a given year
 * using the `date-holidays` npm package.
 *
 * Usage: node get_holidays.js <year>
 * Output: JSON array of { date: "YYYY-MM-DD", name: "..." }
 */

const Holidays = require("date-holidays");

const year = parseInt(process.argv[2], 10) || new Date().getFullYear();

if (isNaN(year) || year < 2000 || year > 2100) {
  process.stderr.write(`Invalid year: ${process.argv[2]}\n`);
  process.exit(1);
}

const hd = new Holidays("VE");
const holidays = hd.getHolidays(year);

// Filter only public holidays and format output
const result = holidays
  .filter((h) => h.type === "public")
  .map((h) => ({
    date: h.date.substring(0, 10), // YYYY-MM-DD
    name: h.name,
  }));

process.stdout.write(JSON.stringify(result, null, 2));
