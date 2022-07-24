/* eslint-disable react/no-unescaped-entities */
import { MY_EMAIL } from 'constants/index'
import React from 'react'
import { Card } from 'react-bootstrap'

const About = () => {
  return (
    <Card.Body>
      <Card.Title>About - ReprMan - Repertoire Management</Card.Title>
      <Card.Subtitle style={{ padding: '10px 0' }}>Why This App?</Card.Subtitle>
      <Card.Text>
        As a jazz musician, I would say that I know about 200 tunes. By know, I
        mean that I can play the melody and chords from memory and improvise
        over them. What I sometimes found is that in reality I could comfortably
        play about 50 of them from memory, maybe play another 50 uncomfortably,
        another 50 with some mistakes, and the last 50...
      </Card.Text>
      <Card.Text>
        The issue is practice. Certain tunes <i>always</i> come up on gigs. And
        certain tunes are more fun to practice. We tend to practice some a lot,
        and some almost never.
      </Card.Text>
      <Card.Text>
        Being a nerd, I worked with spread sheets to have a way to keep track. I
        started adding a field for the date/time that I last practiced it. I
        then added a button for each tune to update the date/time and resort the
        tunes. This app is an evolution of that concept.
      </Card.Text>

      <Card.Subtitle style={{ padding: '10px 0' }}>
        How to Use This App
      </Card.Subtitle>

      <Card.Text>
        It's fairly simple. Enter your songs. Practice the song at the top of
        the list (the one you have not practiced in the longest time) and when
        you're done, press the "Practiced" button, and it moves to the bottom of
        the list.
      </Card.Text>
      <Card.Text>
        You can decide for yourself how to use it. For me, I only put things in
        my list that are "done". I know them. I also work on things that I'm
        learning, but those are just a few things and I don't need to be
        reminded. The list is for my "book" of tunes that I need to manage.
      </Card.Text>

      <hr />

      <Card.Subtitle style={{ padding: '10px 0' }}>The Future</Card.Subtitle>

      <Card.Text>
        This is the beginning. This is the free version of the app. There will
        always be a free version of the app, but eventually there will be a more
        feature rich version. I will have to charge something to cover expenses
        (and make a little), but will try to keep prices low. Some things that
        are being considered:
        <ul>
          <li>accounts</li>
          <li>mobile versions</li>
          <li>remote storage - all versions share the same list</li>
          <li>sharing</li>
        </ul>
      </Card.Text>

      <Card.Text>
        If you have any suggestions, please contact me at {MY_EMAIL}
      </Card.Text>
    </Card.Body>
  )
}

export default About
