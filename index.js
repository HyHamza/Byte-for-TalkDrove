const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    try {
        // Launch browser with specific arguments
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't work in Windows
                '--disable-gpu'
            ]
        });

        // Create a new page
        const page = await browser.newPage();

        // Set viewport size
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to login page
        await page.goto('https://chat.talkdrove.cc.nf/login?next=https://chat.talkdrove.cc.nf/talkdrove/Min');

        // Wait for login form to load
        await page.waitForSelector('form.user');

        // Fill in login details
        await page.type('input[name="email"]', 'talkdrove');
        await page.type('input[name="password"]', '3800380@talkdrove');

        // Click on login button
        await page.click('button[type="submit"]');

        // Wait for chat box to load
        await page.waitForSelector('.chat-box', { timeout: 60000 }); // 60 seconds timeout

        // Wait for 2 seconds to ensure the page is fully loaded
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Logged in successfully!');
        await sendMessage('Bot is deployed now!');
        await page.goto('https://chat.talkdrove.cc.nf/talkdrove');
        // Function to send a message
        async function sendMessage(message) {
            await page.type('.emojionearea-editor', message);
            await page.keyboard.press('Enter');
        }

        // Function to continuously check for new messages
        const intervalId = setInterval(async () => {
            // Extracting messages from the chat box
            const messages = await page.evaluate(() => {
                const messageElements = document.querySelectorAll('.chat-txt');
                const messages = [];
                messageElements.forEach(element => {
                    messages.push(element.textContent.trim());
                });
                return messages;
            });

            // Process the new messages and send responses
            if (messages.length > 0) {
                const message = messages[0]; // Take the first message for processing
                if (message.toLowerCase() === '/test') {
                    console.log('Sending response: Hey, Bot is working!');
                    await sendMessage('Hey, Bot is active!');
                } else if (message.toLowerCase() === '/dev') {
                    console.log('Sending response: Hamza is my developer');
                    await sendMessage('Hamza is my developer');
                } else if (message.toLowerCase() === '/about') {
                    console.log('TalkDrove:');
                    await sendMessage("I'm TalkDrove Bot, my name is Byte, I'm just beta version!");
                } else if (message.toLowerCase() === '/rules') {
                    console.log('Rules: No rules!');
                    await sendMessage('Rules: No rules!');
                } else if (message.toLowerCase() === '/name') {
                    console.log('My name is Byte!');
                    await sendMessage('My name is Byte!');
                }

                // Delete the processed message
                await page.evaluate(() => {
                    const messageElement = document.querySelector('.chat-txt');
                    messageElement.parentNode.removeChild(messageElement);
                });
            }
        }, 1000); // Check for new messages every 1 second

    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
