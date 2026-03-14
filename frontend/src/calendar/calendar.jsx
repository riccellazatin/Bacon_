import { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchTasks, completeTask } from "../redux/actions/taskActions";

const statusColors = {
  ongoing: "#3788d8",
  missing: "#dc3545",
  done: "#28a745",
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
    <div style={{ padding: 20 }}>
      <h2>Task Calendar</h2>

      {loading && <p>Loading tasks...</p>}

      <div style={{ marginBottom: 15 }}>
        <span style={{ marginRight: 15 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, backgroundColor: statusColors.ongoing, marginRight: 5 }}></span>
          Ongoing
        </span>
        <span style={{ marginRight: 15 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, backgroundColor: statusColors.done, marginRight: 5 }}></span>
          Done
        </span>
        <span>
          <span style={{ display: "inline-block", width: 12, height: 12, backgroundColor: statusColors.missing, marginRight: 5 }}></span>
          Missing
        </span>
      </div>

      <div style={{ marginTop: 20 }}>
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
    </div>
  );
}