import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: "Register endpoint disabled – Prisma removed for MVP" })
} 