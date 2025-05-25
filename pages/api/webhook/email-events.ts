import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: "Temporarily disabled for MVP launch. Live routes will return soon." })
}

// Disable body parsing if needed for raw webhook handling
export const config = {
  api: {
    bodyParser: true
  }
}; 