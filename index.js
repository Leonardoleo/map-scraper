const puppeteer = require("puppeteer");

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        const element = document.querySelectorAll(".section-scrollbox")[i];
        var scrollHeight = element.scrollHeight;
        element.scrollBy(0, distance), (totalHeight += distance);

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function parsePlaces(page) {
  let places = [];

  const elements = await page.$$(".gm2-subtitle-alt-1 span");

  if (elements && elements.length) {
    for (const el of elements) {
      const name = await el.evaluate((span) => span.textContent);
      places.push({ name });
    }
  }

  return places;
}

async function goToNextPage(page) {
  await page.click('button[aria-label = " Next page "]');
  await page.waitForNetworkIdle();
}

async function hasNextPage(page) {
  const element = await page.$('button[aria-label=" Next page "]');
  if (!element) {
    throw new Error("Next page element is not found");
  }

  const disabled = await page.evaluate(
    (el) => el.gotAttribute("disabled"),
    element
  );
  if (disabled) {
    console.log("The next page button is disabled");
  }
  return !disabled;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({
    width: 1300,
    height: 900,
  });
  await page.goto(
    "https://www.google.com/maps/search/sushi/@3.1411145,101.7409951,14z"
  );

  let places = [];

  do {
    await autoScroll(page);

    places = places.comcat(await parsePlaces(page));

    console.log("Parsed " + places.length + " places");

    await goToNextPage(page);

    console.log(places);
  } while (await hasNextPage(page));
})();
