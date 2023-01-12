import { useEffect, useState } from 'react'
import { differenceInSeconds, intervalToDuration, nextThursday } from 'date-fns/fp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHourglass } from '@fortawesome/free-solid-svg-icons'

const CountdownTimer: React.FC = () => {
	const [days, setDays] = useState(0)
	const [hours, setHours] = useState(0)
	const [minutes, setMinutes] = useState(0)
	const [seconds, setSeconds] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			const now = new Date()
			const thursday = nextThursday(now)
			thursday.setUTCHours(0)
			thursday.setMinutes(0)
			thursday.setSeconds(0)

			const counterTime = new Date(thursday)

			const dsecs = differenceInSeconds(now, counterTime)
			const dur = intervalToDuration({ start: 0, end: dsecs * 1000 })

			setDays(dur.days)
			setHours(dur.hours)
			setMinutes(dur.minutes)
			setSeconds(dur.seconds)
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	return (
		<div>
			<span className='tracking-wider'>
				<FontAwesomeIcon icon={faHourglass} size='sm' className='mr-1 mt-1 text-text-200' />
				{days.toString().length < 2 ? '0' + days : days}D:{hours.toString().length < 2 ? '0' + hours : hours}H:
				{minutes.toString().length < 2 ? '0' + minutes : minutes}M:{seconds.toString().length < 2 ? '0' + seconds : seconds}S
			</span>
		</div>
	)
}

export default CountdownTimer
