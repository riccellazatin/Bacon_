import { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchTasks, completeTask } from "../redux/actions/taskActions";
import './calendar.css'
import Footer from '../components/Footer/Footer'

const statusColors = {
  ongoing: "#f5b8da",
  missing: "#ffda6f",
  done: "#fd5732",
};

export default function SubmissionCalendar() {
  const calendarRef = useRef(null);
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const events = useMemo(() => {
    return tasks
      .filter((task) => task.deadline || task.scheduled_date)
      .map((task) => {
        let dateStr = task.deadline || task.scheduled_date;
        
        if (dateStr && dateStr.endsWith('Z')) {
          dateStr = dateStr.slice(0, -1);
        }

        return {
          id: task.id,
          title: task.title,
          start: dateStr,
          allDay: false,
          backgroundColor: statusColors[task.status] || statusColors.ongoing,
          borderColor: statusColors[task.status] || statusColors.ongoing,
          extendedProps: {
            description: task.description,
            status: task.status,
            points: task.points_value,
            duration: task.duration_minutes,
          },
        };
      });
  }, [tasks]);

  const handleEventClick = (clickInfo) => {
    const taskId = clickInfo.event.id;
    const status = clickInfo.event.extendedProps.status;

    if (status === "done") {
      alert("This task is already completed!");
      return;
    }

    if (window.confirm(`Mark "${clickInfo.event.title}" as complete?`)) {
      dispatch(completeTask(taskId));
    }
  };

  return (
    <div className="main-calendar-div">
      <h1 className="calendar-title">Task Calendar Overview</h1>

      {loading && <p className="loading">Loading tasks...</p>}

      <div className="legend-div">
        <span className="legend">
          <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: statusColors.ongoing, marginRight: 5 }}></span>
          Ongoing
        </span>
        <span className="legend">
          <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: statusColors.done, marginRight: 5 }}></span>
          Done
        </span>
        <span className="legend">
          <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: statusColors.missing, marginRight: 5 }}></span>
          Missing
        </span>
      </div>

      <div className="calendar-container-screen">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          timeZone="local"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          allDaySlot={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          scrollTime="08:00:00"
          nextDayThreshold="09:00:00"
          forceEventDuration={false}
          defaultTimedEventDuration="00:30:00"
          views={{
            dayGridMonth: {
              displayEventTime: false,
              eventDisplay: 'block'
            },
            timeGridWeek: {
              slotMinTime: "00:00:00",
              slotMaxTime: "24:00:00",
              displayEventTime: true
            },
            timeGridDay: {
              slotMinTime: "00:00:00",
              slotMaxTime: "24:00:00",
              displayEventTime: true
            }
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </div>

      <Footer />
    </div>
  );
}