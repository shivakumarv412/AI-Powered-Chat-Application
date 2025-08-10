import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  try {
    const { message, apiKey } = req.body

    if (!message || !apiKey) {
      return res.status(400).json({ error: 'Message and API key are required' })
    }

    const openai = new OpenAI({
      apiKey: apiKey
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    res.json({ response })
  } catch (error) {
    console.error('Error:', error)
    
    if (error.status === 401) {
      res.status(401).json({ error: 'Invalid API key. Please check your OpenAI API key.' })
    } else if (error.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' })
    } else {
      res.status(500).json({ error: 'An error occurred while processing your request.' })
    }
  }
})

// Export for Vercel serverless function
export default app 