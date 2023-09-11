import { useRef, React, useState, useEffect, Component } from "react";
import {
  SevenColGrid,
  Wrapper,
  HeadDays,
  DateControls,
  StyledEvent,
  SeeMore,
  PortalWrapper
} from "./calendar.styled";
import {
  datesAreOnSameDay,
  getDarkColor,
  getDaysInMonth,
  getMonthYear,
  getSortedDays,
  nextMonth,
  prevMonth,
  range,
  sortDays
} from "./calendar_utils";
import './Calendar.css';
import { getEntries, getUserDetails } from '../../firebase/firebase';
import {onAuthStateChanged} from 'firebase/auth'
import {auth} from '../../firebase/firebase';
import { Card, ListGroup } from 'react-bootstrap';
import { PencilFill, Trash, Speedometer, PeopleFill } from 'react-bootstrap-icons';


import { parse } from 'date-fns';

const DAYS = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

export default function Calendar () {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showPortal, setShowPortal] = useState(false);
  const [portalData, setPortalData] = useState({});
  const [user, setUser] = useState({});
  const [firestoreUserData, setFirestoreUserData] = useState({});
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    getUserDetails(user?.email).then((response) => {
      setFirestoreUserData(response.data());
    });
  }, [user]);

  useEffect(() => {
    const fetchEntries = async () => {
      let newEntries = [];
  
      const userEntriesSnapshot = await getEntries(user.email);
      userEntriesSnapshot.forEach((entry) => {
        var data = entry.data();
        data.id = entry.id;
        data.email = data.uid;
        data.firstName = firestoreUserData.firstName;
        data.lastName = firestoreUserData.lastName;
        data.owner = true;
        newEntries.push(data);
      });
  
      if (firestoreUserData.friends) {
        for (const friendEmail of firestoreUserData.friends) {
          let friendFirestoreData = (await getUserDetails(friendEmail)).data();
          const friendEntriesSnapshot = await getEntries(friendEmail);
          friendEntriesSnapshot.forEach((entry) => {
            var data = entry.data();
            // Only show data which is marked as shareable
            if (data.share) {
              data.id = entry.id;
              data.email = data.uid;
              data.firstName = friendFirestoreData.firstName;
              data.lastName = friendFirestoreData.lastName;
              data.owner = false;
              newEntries.push(data);
            }
          });
        }
      }
  
      setEntries(newEntries);
    };
  
    fetchEntries();
  }, [firestoreUserData]);

  useEffect(() => {
    setEvents(prevEvents => {
      const eventsCopy = [...prevEvents];
      entries.forEach(entry => {
        const eventExists = eventsCopy.some(event => (
          event.title === entry.reason &&
          event.date === entry.date
        ));
        if (!eventExists) {
          eventsCopy.push({ 
            entry : entry, color : getDarkColor() });
        }
      });
      return eventsCopy;
    });
  }, [entries, setEvents]);

  const handleOnClickEvent = (event) => {
    setShowPortal(true);
    setPortalData(event);
  };

  const handlePotalClose = () => setShowPortal(false);

  return (
    <Wrapper>
      <DateControls>
        <ion-icon
          onClick={() => prevMonth(currentDate, setCurrentDate)}
          name="arrow-back-circle-outline"
        ></ion-icon>
        <div className="month">
        {getMonthYear(currentDate)}
        </div>
        <ion-icon
          onClick={() => nextMonth(currentDate, setCurrentDate)}
          name="arrow-forward-circle-outline"
        ></ion-icon>
      </DateControls>
      <SevenColGrid>
        {DAYS.map((day) => (
          <HeadDays className="nonDRAG">{day}</HeadDays>
        ))}
      </SevenColGrid>

      <SevenColGrid
        fullheight={true}
      >
        {getSortedDays(currentDate).map((day) => (
          <div
            id={`${currentDate.getFullYear()}/${currentDate.getMonth()}/${day}`}
          >
            <span
              className={`nonDRAG ${
                datesAreOnSameDay(
                  new Date(),
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  )
                )
                  ? "active"
                  : ""
              }`}
            >
              {day}
            </span>
            <EventWrapper>
              {events.map(
                (ev, index) => {
                  const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day,
                  );
                  const formattedDate = `${ev.entry.date.slice(5, 7)}-${ev.entry.date.slice(8)}-${ev.entry.date.slice(0, 4)}`;

                  const isSameDay = datesAreOnSameDay(new Date(Date.parse(formattedDate)), date);
                  if (isSameDay) {
                    return (
                      <StyledEvent
                        onClick={() => handleOnClickEvent(ev)}
                        className="StyledEvent"
                        id={`${ev.color} ${ev.entry.reason}`}
                        key={ev.entry.reason}
                        bgColor={ev.color}
                      >
                        💧 {ev.entry.reason} 💧
                      </StyledEvent>
                    )
                  }
                }
              )}
            </EventWrapper>

          </div>
        ))}
      </SevenColGrid>
      {showPortal && (
        <Portal
          {...portalData}
          handlePotalClose={handlePotalClose}
        />
      )}
    </Wrapper>
  );
};

const EventWrapper = ({ children }) => {
  if (children.filter((child) => child).length)
    return (
      <>
        {children}
        {children.filter((child) => child).length > 2 && (
          <SeeMore
            onClick={(e) => {
              e.stopPropagation();
              console.log("clicked p");
            }}
          >
            see more...
          </SeeMore>
        )}
      </>
    );
};

const Portal = ({ entry, handleDelete, handlePotalClose }) => {
  const unwrapField = (field) => {
    if (field === undefined || field === "" || field === null) {
      return "N/A";
    }
    return field;
  };

  return (
    <PortalWrapper>
      <Card>
        <Card.Header>{entry.firstName + " " + entry.lastName + " (" + entry.email + ")"}</Card.Header>

        <Card.Header>
          <Card.Title className="text-center">{ entry.date }</Card.Title>
          <Card.Subtitle className="text-center mb-2 text-muted">{ entry.time } { entry.timezone }</Card.Subtitle> 
          </Card.Header>
          <Card.Body>
            { entry.photo_url ? <Card.Img variant="top" src={entry.photo_url} /> : null }
            <Card.Text>
              <b>Reason:</b> {entry.reason}
            </Card.Text>
          </Card.Body>
          <ListGroup className="list-group-flush">
            <ListGroup.Item> <b>Notes:</b> {unwrapField(entry.other)}</ListGroup.Item>
          </ListGroup>
          <Card.Footer className='footer'>
            <Speedometer size={30}/> { unwrapField(entry.severity) }{entry.severity ? (<>/100</>) : null } {" "} {" "}&nbsp;&nbsp;&nbsp;
            <PeopleFill size={30}/> { entry.share ? "On" : "Off" }
          </Card.Footer>
      </Card>
      
        
      <ion-icon onClick={handlePotalClose} name="close-outline"></ion-icon>
    </PortalWrapper>
  );
};