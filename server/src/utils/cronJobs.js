import cron from 'node-cron'
import prisma from '../config/prisma.js'

export const startCronJobs = () => {
  // Chạy mỗi giờ một lần (ở phút thứ 0 của mỗi giờ)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running job to cancel expired pending bookings...')
    
    try {
      // Tìm thời điểm 24 giờ trước
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      // Cập nhật tất cả các booking pending đã tạo trước mốc 24h
      const result = await prisma.bookings.updateMany({
        where: {
          status: 'pending',
          created_at: {
            lt: twentyFourHoursAgo,
          },
        },
        data: {
          status: 'cancelled',
        },
      })

      if (result.count > 0) {
        console.log(`[CRON] Successfully cancelled ${result.count} expired pending booking(s).`)
      } else {
        console.log('[CRON] No expired pending bookings found.')
      }
    } catch (error) {
      console.error('[CRON] Error cancelling expired bookings:', error)
    }
  })
}
