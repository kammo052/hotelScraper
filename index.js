import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import path from 'path';
import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromeDriverPath = path.join(__dirname, 'drivers', 'chromedriver.exe');
const serviceBuilder = new chrome.ServiceBuilder(chromeDriverPath);

const delay = ms => new Promise(res => setTimeout(res, ms));

const buildBookingUrl = (city, checkin, checkout) => {
    const params = new URLSearchParams({
        ss: city,
        checkin,
        checkout,
        group_adults: "2",
        group_children: "1",
        age: "1",
        no_rooms: "1",
        selected_currency: "INR",
        nflt: "class=5;review_score=90",
        order: "price",
        lang: "en-us",
    });
    return `https://www.booking.com/searchresults.html?${params.toString()}`;
};

function buildAgodaUrl(city, checkin, checkout) {
    const baseUrl = "https://www.agoda.com/search";
    const params = new URLSearchParams({
        city: city, // ideally city ID like "14552"
        checkIn: checkin,
        checkOut: checkout,
        rooms: "1",
        adults: "2",
        children: "1",
        childages: "1",
        hotelStarRating: "5",
        reviewScore: "9",
        locale: "en-us",
        currency: "INR",
        priceCur: "INR",
        sort: "priceLowToHigh",
        textToSearch: "New Delhi and NCR"
    });

    return `${baseUrl}?${params.toString()}`;
}


async function scrapeBooking(city, checkin, checkout, isHeadless) {
    const url = buildBookingUrl(city, checkin, checkout);

    const options = new chrome.Options();
    if (isHeadless) options.addArguments("--headless=new");
    options.addArguments("--no-sandbox", "--disable-dev-shm-usage");

    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .setChromeService(serviceBuilder)
        .build();

    try {
        await driver.get(url);
         await delay(1000); // Wait for dynamic content
        await driver.wait(until.elementLocated(By.xpath("(//div[@aria-label='Property'])[1]")), 10000);

        // Extract the hotel name
        const hotelCard = await driver.findElement(By.xpath("(//div[@aria-label='Property'])[1]"));

        const hotelNameElem = await hotelCard.findElement(By.css("[data-testid='title']"));
        const hotelName = await hotelNameElem.getText();
        // Extract the price (class names are unreliable, so fallback to span inside price container)
        const priceElem = await hotelCard.findElement(By.css("[data-testid='price-and-discounted-price'], .fcab3ed991"));
        const price = await priceElem.getText();
        // Extract the link
        const linkElem = await hotelCard.findElement(By.css("a[data-testid='title-link']"));
        const link = await linkElem.getAttribute("href");
        return {
            site: "Booking.com",
            hotelName: hotelName.trim(),
            price: parsePrice(price),
            link,
        };
    } finally {
        await driver.quit();
    }
}

// Dummy example for Agoda scraper (replace selectors accordingly)
async function scrapeAgoda(city, checkin, checkout, isHeadless) {
    const url = buildAgodaUrl(city, checkin, checkout);

    const options = new chrome.Options();
    if (isHeadless) options.addArguments("--headless=new");
    options.addArguments("--no-sandbox", "--disable-dev-shm-usage");

    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .setChromeService(serviceBuilder)
        .build();

    try {
        await driver.get(url);
        //await delay(1000); // Wait for dynamic content

        // Wait for hotel cards to load
        await driver.wait(until.elementLocated(By.xpath("(//div[contains(@aria-label,'Property Card')])[1]")), 15000);

        const hotelCard = await driver.findElement(By.xpath("(//div[contains(@aria-label,'Property Card')])[1]"));

        const hotelName = await hotelCard.findElement(By.css('[data-selenium ="hotel-name"]')).getText();

        const price = await hotelCard.findElement(By.css('[data-selenium="display-price"]')).getText();

        const linkElem = await hotelCard.findElement(By.css("a.PropertyCard__Link"));
        const link = await linkElem.getAttribute("href");
        
        return {
            site: "Agoda",
            hotelName: hotelName.trim(),
            price: parsePrice(price),
            link,
        };
    } finally {
        await driver.quit();
    }
}

// Helper: Convert price string to number for comparison
function parsePrice(priceStr) {
    // Remove currency and commas, convert to number
    return Number(priceStr.replace(/[^\d]/g, ""));
}

// Main
async function main() {
    const city = "New Delhi";
    const checkin = "2025-06-01";
    const checkout = "2025-06-05";
    const isHeadless = process.argv.includes("--headless");

    const bookingData = await scrapeBooking(city, checkin, checkout, isHeadless);
    const agodaData = await scrapeAgoda("14552", checkin, checkout, isHeadless);
    // Compare prices, find lowest
    const bestDeal = [bookingData, agodaData].reduce((prev, curr) =>
        curr.price < prev.price ? curr : prev
    );

    console.log("Best deal found:");
    console.log(`Site: ${bestDeal.site}`);
    console.log(`Hotel: ${bestDeal.hotelName}`);
    console.log(`Price: ₹${bestDeal.price}`);
    console.log(`Booking Link: ${bestDeal.link}`);
}

main().catch(console.error);
