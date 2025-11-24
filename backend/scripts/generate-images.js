const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const images = [
  {
    name: 'tunnel-light.png',
    prompt: 'A dramatic dark tunnel with bright golden light at the end, cinematic lighting, hope and breakthrough, inspiring atmosphere, photorealistic, 4k quality, wide angle'
  },
  {
    name: 'brain-day1.png',
    prompt: 'A 3D rendered human brain glowing softly with orange and yellow energy, just beginning to light up, gym weights in background, minimalist black background, cinematic lighting, mental fitness concept, vertical portrait orientation'
  },
  {
    name: 'brain-day30.png',
    prompt: 'A 3D rendered human brain glowing brighter with orange and yellow energy, small lightning bolts, surrounded by subtle gym equipment, showing progress, black background, powerful and focused, vertical portrait orientation'
  },
  {
    name: 'brain-day90.png',
    prompt: 'A 3D rendered human brain intensely glowing with orange, yellow and white energy, electrical connections firing, strong aura, gym equipment around it, black background, showing mental strength, vertical portrait orientation'
  },
  {
    name: 'brain-day180.png',
    prompt: 'A 3D rendered human brain radiating brilliant golden and orange light, energy waves emanating, crown-like glow, victorious and empowered, black background with golden particles, peak mental performance, vertical portrait orientation'
  }
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function generateImages() {
  console.log('🎨 Starting image generation with DALL-E...\n');

  const outputDir = path.join(__dirname, '../uploads/generated-images');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < images.length; i++) {
    const { name, prompt } = images[i];
    console.log(`[${i + 1}/${images.length}] Generating: ${name}`);
    console.log(`Prompt: ${prompt}\n`);

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1792", // Vertical for portrait
        quality: "standard"
      });

      const imageUrl = response.data[0].url;
      const filepath = path.join(outputDir, name);

      console.log(`⬇️  Downloading ${name}...`);
      await downloadImage(imageUrl, filepath);
      console.log(`✅ Saved: ${name}\n`);

      // Wait 2 seconds between requests to avoid rate limits
      if (i < images.length - 1) {
        console.log('⏳ Waiting 2 seconds before next generation...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);

      // If rate limited, wait longer
      if (error.status === 429) {
        console.log('⏳ Rate limited. Waiting 10 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
        i--; // Retry this image
      }
    }
  }

  console.log('\n🎉 All images generated successfully!');
  console.log(`📁 Images saved to: ${outputDir}`);
}

// Run the script
generateImages().catch(console.error);
