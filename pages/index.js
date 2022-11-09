import Grouping from '../components/grouping'
import { Box, Container, Grid, Heading, Text, Link } from 'theme-ui'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import Signup from '../components/signup'
import Years from '../components/years'
import Regions from '../components/regions'
import EventCard from '../components/event-card'
import { filter, orderBy, slice, last, startsWith, remove } from 'lodash'
import { timeSince, humanizedDateRange } from '../lib/util'
import { getGroupingData } from '../lib/data'

const title = `High School Hackathons in ${new Date().getFullYear()}`
const eventsPreview = events =>
  slice(events, 0, 4)
    .map(
      event =>
        `${event.name} (${humanizedDateRange(event.start, event.end)}) … `
    )
    .join('')

export default ({ stats, emailStats, events, yearEvents, year }) => (
  <>
    <Grouping
      includeMeta={false}
      header={
        <>
          <Meta
            as={Head}
            title={title}
            description={`${title}. A curated list of online and in-person high school hackathons with ${
              events.length
            } events in ${stats.state} states + ${
              stats.country
            } countries. Maintained by the Hack Club staff. ${eventsPreview(
              events
            )}`}
          />
          <Heading as="h1" variant="title" sx={{ color: 'primary' }}>
            High School Hackathons{' '}
            <Box as="br" sx={{ display: ['none', 'block'] }} />
            in {new Date().getFullYear()}
          </Heading>
          <Text as="p" variant="subtitle" sx={{ my: 3 }}>
            A curated list of high school hackathons with
            <Box as="br" sx={{ display: ['none', 'block'] }} /> {stats.total}
            &nbsp;events in {stats.state}
            &nbsp;states + {stats.country}
            &nbsp;countries.
          </Text>
          <Text as="p" variant="subtitle">
            {' '}
            Maintained by the{' '}
            <Link href="https://hackclub.com/">Hack Club</Link> staff.
          </Text>
        </>
      }
      events={events}
      footer={
        <section>
          <Heading variant="headline" sx={{ mt: [4, 5], mb: [3, 4] }}>
            Explore by year
          </Heading>
          <Years />
          <Heading variant="headline" sx={{ mt: [4, 5], mb: [3, 4] }}>
            Explore popular regions
          </Heading>
          <Regions />
        </section>
      }
      useFilter
    >
      <Signup stats={emailStats} />
    </Grouping>
    <Container sx={{ mt: [3, 4, 5], py: [3, null, 4] }}>
      <Heading variant="headline" sx={{ textAlign: 'center' }}>
        Past events in {year}
      </Heading>
      <Grid columns={[1, 2, 3]} gap={[3, 4]} sx={{ mt: [3, 4, 5] }}>
        {yearEvents.map(event => (
          <EventCard id={event.id} key={event.id} {...event} />
        ))}
      </Grid>
    </Container>
  </>
)

export const getStaticProps = async () => {
  let { events, emailStats, yearEvents } = await getGroupingData()
  let stats = {
    total: events.length,
    state: new Set(
      events
        .filter(event => ['US', 'USA', 'United States'].includes(event.country))
        .map(event => event.state)
    ).size,
    country: new Set(events.map(event => event.country)).size,
    lastUpdated: timeSince(
      last(orderBy(events, 'createdAt')).createdAt,
      false,
      new Date(),
      true
    )
  }
  const year = new Date().getFullYear().toString()
  yearEvents = filter(events, e => startsWith(e.start, year))
  yearEvents = orderBy(events, 'start')

  yearEvents = orderBy(
    filter(
      events,
      e =>
        new Date(e.end).getFullYear() >= new Date().getFullYear() &&
        new Date(e.end) <= new Date()
    ),
    'start'
  )

  // Sort upcoming events by start date
  events = orderBy(
    filter(events, e => new Date(e.end) >= new Date()),
    'start'
  )
  return {
    props: { events, yearEvents, stats, emailStats, year },
    revalidate: 1
  }
}