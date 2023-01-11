import { useEffect, useState } from 'react'

const CountdownTimer: React.FC = () => {
	const [days, setDays] = useState(0)
	const [hours, setHours] = useState(0)
	const [minutes, setMinutes] = useState(0)
	const [seconds, setSeconds] = useState(0)
	const [diff, setDiff] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			const now = new Date()
			const day = 4
			const counterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
			const curTime = now.getTime()
			const target = counterTime.getTime()

			let _diff = target - curTime
			let curDay

			console.log('now', now)
			console.log('counterTime', counterTime)
			console.log('curTime', curTime)
			console.log('target', target)

			if (_diff > 0) {
				curDay = day - now.getDay()
			} else {
				curDay = day - now.getDay() - 1
			} //after countdown time
			if (curDay < 0) {
				curDay += 7
			} //already after countdown time, switch to next week
			if (_diff <= 0) {
				_diff += 86400 * 7
			}

			setDiff(_diff)

			console.log('curDay', day - now.getDay() - 1)
			console.log('nowDay', now.getDay())
			console.log('_diff', _diff)
			console.log('diff', diff)

			const d = Math.floor(diff / (1000 * 60 * 60 * 24))
			const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
			const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
			const s = Math.floor((diff % (1000 * 60)) / 1000)

			setDays(d)
			setHours(h)
			setMinutes(m)
			setSeconds(s)
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	return (
		<div>
			<span>
				{days.toString().length < 2 ? '0' + days : days}D:{hours.toString().length < 2 ? '0' + hours : hours}H:
				{minutes.toString().length < 2 ? '0' + minutes : minutes}M:{seconds.toString().length < 2 ? '0' + seconds : seconds}S
			</span>
		</div>
	)
}

export default CountdownTimer
