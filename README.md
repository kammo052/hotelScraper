````markdown
# Booking.com Selenium Scraper

This project uses Selenium WebDriver with Chrome to scrape top-rated 5-star hotels from Booking.com for a given city and date range.

## Setup

1. Clone the repository and navigate into it:

   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Make sure you have [Chrome](https://www.google.com/chrome/) installed and the compatible [ChromeDriver](https://sites.google.com/chromium.org/driver/) in your system PATH.

## Usage

The main script is `index.js`. It scrapes hotel data for New Delhi from May 24 to May 29, 2025 by default.

### Run without headless mode (shows browser UI)

```bash
npm start
```

or

```bash
npm run test
```

### Run in headless mode (no browser UI, faster)

```bash
npm run test:headless
```

## How it works

* Builds a example.com search URL with specified city and dates.
* Launches a Chrome browser via Selenium WebDriver.
* Waits for hotel results to load.
* Extracts and prints the top-rated 5-star hotel name, price, and link.
* Closes the browser.

## Customize

To scrape a different city or dates, edit the parameters in `index.js` or modify the script arguments.

