import { useMemo } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import "./MiniCalendar.css";

const statusColors = {
  ongoing: "#3788d8",
  missing: "#dc3545",
  done: "#28a745",
};

export default function MiniCalendar() {
  const navigate = useNavigate();
  const { tasks } = useSelector((state) => state.tasks);

  const events = useMemo(() => {
    return tasks
      .filter((task) => task.deadline || task.scheduled_date)
      .map((task) => {
        let dateStr = task.deadline || task.scheduled_date;
        if (dateStr && dateStr.endsWith('Z')) {
          dateStr = dateStr.slice(0, -1);
        }
        const dateOnly = dateStr ? dateStr.split('T')[0] : null;

        return {
          id: task.id,
          title: task.title,
          start: dateOnly,
          allDay: true,
          backgroundColor: statusColors[task.status] || statusColors.ongoing,
          borderColor: statusColors[task.status] || statusColors.ongoing,
        };
      });
  }, [tasks]);

  return (
    <div className="mini-calendar-container">
      <div className="mini-calendar-header">
        <h4 className="calendar-title">Task Calendar Overview</h4>
        <button 
          className="view-full-btn"
          onClick={() => navigate('/calendar')}
        >
          View Full Calendar
        </button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "today"
        }}
        events={events}
        height={300}
        eventClick={() => navigate('/calendar')}
      />
    </div>
  );
}
