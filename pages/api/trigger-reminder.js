import { getEvents } from '../../lib/data'

export default async (req, res) => {
  const token = process.env.TOKEN
  if (!token) {
    return res
      .status(200)
      .json({ msg: 'No token set, are you in dev/preview?' })
  }

  const authed = req.headers['authorization'] == 'Bearer ' + token

  if (!authed) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // get events that are upcoming and 4 weeks out
  const events = await getEvents(
    "AND(DATETIME_DIFF(start,TODAY(), 'days') < 29, DATETIME_DIFF(start,TODAY(), 'days') > 0, virtual = FALSE(), subscriber_email_sent = FALSE())"
  )

  const eventPromises = events.map(event =>
    fetch(`https://hackathons.hackclub.com/api/events/${event.id}/remind`, {
      method: 'POST',
      headers: {
        authorization: req.headers['authorization']
      }
    })
  )

  await Promise.all(eventPromises)

  return res.status(200).json({ msg: 'OK', events: events })
}
