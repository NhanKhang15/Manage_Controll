import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STATUS_COLOR, flattenProjectTasks, projectColor, type ProjectNode, type ProjectTaskNode, type TaskStatus } from "./types";

export interface ProjectTimelineProps {
  projects: ProjectNode[];
  onSelectTask?: (task: ProjectTaskNode) => void;
}

// Data model for flattened table rows (Project or Task)
interface TimelineRowItem {
  id: string;
  type: "project" | "task";
  project: ProjectNode;
  task?: ProjectTaskNode;
  name: string;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  startDate: Date;
  endDate: Date;
  progressPercent: number;
  isRush: boolean;
  isMilestone: boolean;
  status?: TaskStatus;
  dotColor?: string;
  accentColor: string;
}

interface DateColumn {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  monthKey: string; // e.g. "Th7/2026"
  monthName: string; // "Tháng 7/2026"
  isToday: boolean;
  isWeekend: boolean;
}

interface MonthGroup {
  monthKey: string;
  monthName: string;
  colSpan: number;
}

// Utility functions for dates
function startOfDay(d: Date | string): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function diffDays(d1: Date, d2: Date): number {
  return Math.round((startOfDay(d1).getTime() - startOfDay(d2).getTime()) / 86400000);
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function isOverdue(t: ProjectTaskNode, todayStr: string): boolean {
  return !!t.dueDate && !t.completed && t.dueDate < todayStr;
}

function getProjectSpan(tasks: ProjectTaskNode[]): { start: Date; end: Date } {
  if (tasks.length === 0) {
    const now = startOfDay(new Date());
    return { start: now, end: addDays(now, 14) };
  }
  let minTime = startOfDay(tasks[0].createdAt).getTime();
  let maxTime = tasks[0].dueDate ? startOfDay(tasks[0].dueDate).getTime() : minTime + 86400000;

  for (const t of tasks) {
    const s = startOfDay(t.createdAt).getTime();
    const e = t.dueDate ? startOfDay(t.dueDate).getTime() : s + 86400000;
    if (s < minTime) minTime = s;
    if (e > maxTime) maxTime = e;
  }

  if (maxTime <= minTime) maxTime = minTime + 86400000;
  return { start: new Date(minTime), end: new Date(maxTime) };
}

export function ProjectTimeline({ projects, onSelectTask }: ProjectTimelineProps) {
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(() => new Set());
  const [zoomMode, setZoomMode] = useState<"day" | "week" | "month">("day");
  const [columnWidth, setColumnWidth] = useState<number>(36);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    subtitle: string;
    details: string[];
  }>({ visible: false, x: 0, y: 0, title: "", subtitle: "", details: [] });

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => formatDateStr(today), [today]);

  // Adjust default column width when zoom mode changes
  const handleZoomModeChange = (mode: "day" | "week" | "month") => {
    setZoomMode(mode);
    if (mode === "day") setColumnWidth(36);
    else if (mode === "week") setColumnWidth(16);
    else setColumnWidth(6);
  };

  const toggleProject = useCallback((id: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => setCollapsedProjects(new Set());
  const collapseAll = () => setCollapsedProjects(new Set(projects.map((p) => p.id)));

  // Sort projects: Rush / Overdue projects first (as specified in Jira style design)
  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aRush = flattenProjectTasks(a.tasks).some((t) => isOverdue(t, todayStr));
      const bRush = flattenProjectTasks(b.tasks).some((t) => isOverdue(t, todayStr));
      return aRush === bRush ? 0 : aRush ? -1 : 1;
    });
  }, [projects, todayStr]);

  // Calculate global date bounds covering all projects and tasks with wide buffer for zoom-out
  const { startDateRange, totalDays } = useMemo(() => {
    let minD = addDays(today, -180).getTime(); // at least 6 months back
    let maxD = addDays(today, 365).getTime(); // at least 12 months forward

    for (const p of projects) {
      const flat = flattenProjectTasks(p.tasks);
      const span = getProjectSpan(flat);
      if (span.start.getTime() < minD) minD = span.start.getTime();
      if (span.end.getTime() > maxD) maxD = span.end.getTime();
    }

    // Align start to 1st day of its month
    const start = new Date(minD);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    // Align end to last day of its month
    const end = new Date(maxD);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);

    const daysCount = diffDays(end, start) + 1;

    return {
      startDateRange: start,
      totalDays: Math.max(365, daysCount),
    };
  }, [projects, today]);

  // Build daily date columns & month groups
  const { dateColumns, monthGroups } = useMemo(() => {
    const columns: DateColumn[] = [];
    const monthsMap = new Map<string, { name: string; count: number }>();

    for (let i = 0; i < totalDays; i++) {
      const d = addDays(startDateRange, i);
      const dStr = formatDateStr(d);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();
      const monthKey = `Th${mNum}/${yNum}`;
      const monthName = `Tháng ${mNum}/${yNum}`;
      const dayOfWeek = d.getDay();

      columns.push({
        date: d,
        dateStr: dStr,
        dayNum: d.getDate(),
        monthKey,
        monthName,
        isToday: dStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });

      const existing = monthsMap.get(monthKey);
      if (existing) {
        existing.count += 1;
      } else {
        monthsMap.set(monthKey, { name: monthName, count: 1 });
      }
    }

    const groups: MonthGroup[] = Array.from(monthsMap.entries()).map(([key, value]) => ({
      monthKey: key,
      monthName: value.name,
      colSpan: value.count,
    }));

    return { dateColumns: columns, monthGroups: groups };
  }, [startDateRange, totalDays, todayStr]);

  // Flatten active project & task tree into visible rows
  const visibleRows = useMemo(() => {
    const rows: TimelineRowItem[] = [];

    for (const project of orderedProjects) {
      const flat = flattenProjectTasks(project.tasks);
      const rush = flat.some((t) => isOverdue(t, todayStr));
      const span = getProjectSpan(flat);
      const isExpanded = !collapsedProjects.has(project.id);
      const color = projectColor(project.name);

      rows.push({
        id: `p-${project.id}`,
        type: "project",
        project,
        name: project.name,
        level: 0,
        hasChildren: flat.length > 0,
        isExpanded,
        startDate: span.start,
        endDate: span.end,
        progressPercent: project.progressPercent,
        isRush: rush,
        isMilestone: false,
        accentColor: color,
      });

      if (isExpanded) {
        for (const t of flat) {
          const tStart = startOfDay(t.createdAt);
          const tEndRaw = t.dueDate ? startOfDay(t.dueDate) : addDays(tStart, 1);
          const tEnd = tEndRaw > tStart ? tEndRaw : addDays(tStart, 1);

          rows.push({
            id: t.id,
            type: "task",
            project,
            task: t,
            name: t.title,
            level: 1,
            hasChildren: false,
            isExpanded: false,
            startDate: tStart,
            endDate: tEnd,
            progressPercent: t.progressPercent ?? 0,
            isRush: isOverdue(t, todayStr),
            isMilestone: !!t.isMilestone,
            status: t.status,
            dotColor: STATUS_COLOR[t.status] || "#3b82f6",
            accentColor: STATUS_COLOR[t.status] || "#3b82f6",
          });
        }
      }
    }

    return rows;
  }, [orderedProjects, collapsedProjects, todayStr]);

  // Position of today indicator line
  const todayIndex = useMemo(() => {
    return diffDays(today, startDateRange);
  }, [today, startDateRange]);

  const scrollToToday = useCallback(() => {
    if (timelineContainerRef.current && todayIndex >= 0) {
      const containerWidth = timelineContainerRef.current.clientWidth;
      const targetScrollLeft = todayIndex * columnWidth - containerWidth / 2 + columnWidth / 2 + 300;
      timelineContainerRef.current.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: "smooth" });
    }
  }, [todayIndex, columnWidth]);

  useEffect(() => {
    // Initial scroll to center today after render
    const timer = setTimeout(scrollToToday, 100);
    return () => clearTimeout(timer);
  }, [scrollToToday]);

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineContainerRef.current) return;
    // Only drag scroll if clicked on background or header (not buttons or text selections)
    const target = e.target as HTMLElement;
    if (target.closest(".tl-row-name-cell") || target.closest("button")) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX - timelineContainerRef.current.offsetLeft;
    scrollLeftRef.current = timelineContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !timelineContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - timelineContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    timelineContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Tooltip handlers
  const handleBarMouseEnter = (e: React.MouseEvent, row: TimelineRowItem) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const subtitle = row.type === "project" ? `Dự án · Progress: ${row.progressPercent}%` : `Công việc · Trạng thái: ${row.status || "Chưa rõ"}`;
    const details = [
      `Bắt đầu: ${formatDisplayDate(row.startDate)}`,
      `Hạn chót: ${formatDisplayDate(row.endDate)}`,
    ];
    if (row.task?.picName) details.push(`Phụ trách: ${row.task.picName}`);

    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      title: row.name,
      subtitle,
      details,
    });
  };

  const handleBarMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  if (projects.length === 0) {
    return <div className="mini-empty">Công ty chưa có dự án nào.</div>;
  }

  const timelineGridWidth = totalDays * columnWidth;

  return (
    <div className="vela-timeline-wrapper">
      {/* Control Toolbar */}
      <div className="tl-toolbar">
        <div className="tl-toolbar-left">
          <div className="tl-btn-group">
            <button
              type="button"
              className={`tl-mode-btn ${zoomMode === "day" ? "active" : ""}`}
              onClick={() => handleZoomModeChange("day")}
            >
              Ngày
            </button>
            <button
              type="button"
              className={`tl-mode-btn ${zoomMode === "week" ? "active" : ""}`}
              onClick={() => handleZoomModeChange("week")}
            >
              Tuần
            </button>
            <button
              type="button"
              className={`tl-mode-btn ${zoomMode === "month" ? "active" : ""}`}
              onClick={() => handleZoomModeChange("month")}
            >
              Tháng
            </button>
          </div>

          <div className="tl-zoom-controls">
            <span className="tl-zoom-label">Thu phóng:</span>
            <button
              type="button"
              className="tl-zoom-btn"
              title="Thu nhỏ"
              onClick={() => setColumnWidth((w) => Math.max(4, w - 6))}
            >
              −
            </button>
            <input
              type="range"
              min={4}
              max={80}
              value={columnWidth}
              onChange={(e) => setColumnWidth(Number(e.target.value))}
              className="tl-zoom-slider"
            />
            <button
              type="button"
              className="tl-zoom-btn"
              title="Phóng to"
              onClick={() => setColumnWidth((w) => Math.min(80, w + 6))}
            >
              +
            </button>
            <span className="tl-zoom-val">{columnWidth}px/ngày</span>
          </div>
        </div>

        <div className="tl-toolbar-right">
          <button type="button" className="tl-action-btn today-btn" onClick={scrollToToday}>
            📍 Hôm nay
          </button>
          <button type="button" className="tl-action-btn" onClick={expandAll}>
            ▾ Mở tất cả
          </button>
          <button type="button" className="tl-action-btn" onClick={collapseAll}>
            ▸ Thu gọn
          </button>
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      <div
        className="tl-main-container"
        ref={timelineContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <div className="tl-layout-table" style={{ width: 320 + timelineGridWidth }}>
          {/* Left Table Header */}
          <div className="tl-left-header">Dự án</div>

          {/* Right Date Timeline Header */}
          <div className="tl-right-header" style={{ width: timelineGridWidth }}>
            {/* Top Month Header Row */}
            <div className="tl-month-row">
              {monthGroups.map((mg) => (
                <div
                  key={mg.monthKey}
                  className="tl-month-cell"
                  style={{ width: mg.colSpan * columnWidth }}
                >
                  {mg.monthKey}
                </div>
              ))}
            </div>

            {/* Bottom Day Header Row */}
            <div className="tl-day-row">
              {dateColumns.map((col) => (
                <div
                  key={col.dateStr}
                  className={`tl-day-cell ${col.isWeekend ? "is-weekend" : ""} ${col.isToday ? "is-today" : ""}`}
                  style={{ width: columnWidth }}
                >
                  {zoomMode === "month" ? (col.dayNum === 1 ? col.date.getMonth() + 1 : "") : col.dayNum}
                </div>
              ))}
            </div>
          </div>

          {/* Table Rows Body */}
          <div className="tl-body-content">
            {visibleRows.map((row) => {
              const isHovered = hoveredRowId === row.id;

              return (
                <div
                  key={row.id}
                  className={`tl-row-item ${row.type === "project" ? "is-project-row" : "is-task-row"} ${
                    isHovered ? "is-hovered" : ""
                  }`}
                  onMouseEnter={() => setHoveredRowId(row.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  {/* Left Column Cell */}
                  <div className="tl-left-cell">
                    <div
                      className="tl-row-name-cell"
                      style={{ paddingLeft: row.level * 28 + 12 }}
                      onClick={() => {
                        if (row.type === "task" && row.task) {
                          onSelectTask?.(row.task);
                        }
                      }}
                    >
                      {row.type === "project" ? (
                        <>
                          <button
                            type="button"
                            className="tl-expander-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProject(row.project.id);
                            }}
                          >
                            {row.isExpanded ? "▼" : "▶"}
                          </button>

                          <span className="tl-project-stripe" style={{ background: row.accentColor }} />

                          <span className="tl-name-text project-name" title={row.name}>
                            {row.name}
                          </span>

                          {row.isRush && <span className="tl-alert-badge" title="Dự án có công việc trễ hạn">⚠️ {Math.round(row.progressPercent)}%</span>}
                          {!row.isRush && <span className="tl-progress-badge">{Math.round(row.progressPercent)}%</span>}
                        </>
                      ) : (
                        <>
                          <span className="tl-status-dot" style={{ background: row.dotColor }} />
                          <span className="tl-name-text task-name" title={row.name}>
                            {row.isMilestone && "🚩 "}
                            {row.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Timeline Canvas Row */}
                  <div className="tl-right-cell" style={{ width: timelineGridWidth }}>
                    {/* Background Column Grid Lines */}
                    {dateColumns.map((col) => (
                      <div
                        key={col.dateStr}
                        className={`tl-grid-col ${col.isWeekend ? "is-weekend" : ""} ${col.isToday ? "is-today" : ""}`}
                        style={{ width: columnWidth }}
                      />
                    ))}

                    {/* Bars & Milestones */}
                    {(() => {
                      const startOffset = diffDays(row.startDate, startDateRange);
                      const endOffset = diffDays(row.endDate, startDateRange);
                      const durationDays = Math.max(1, endOffset - startOffset);

                      const leftPx = startOffset * columnWidth;
                      const widthPx = Math.max(zoomMode === "month" ? 8 : 20, durationDays * columnWidth - 2);

                      if (row.isMilestone) {
                        const centerPx = (startOffset + 0.5) * columnWidth;
                        return (
                          <div
                            className="tl-milestone-marker"
                            style={{ left: centerPx - 8 }}
                            onMouseEnter={(e) => handleBarMouseEnter(e, row)}
                            onMouseLeave={handleBarMouseLeave}
                            onClick={() => row.task && onSelectTask?.(row.task)}
                          >
                            ◆
                          </div>
                        );
                      }

                      if (row.type === "project") {
                        return (
                          <div
                            className="tl-bar tl-project-bar"
                            style={{
                              left: leftPx,
                              width: widthPx,
                              background: `linear-gradient(90deg, ${row.accentColor} 0%, ${row.accentColor}dd 100%)`,
                            }}
                            onMouseEnter={(e) => handleBarMouseEnter(e, row)}
                            onMouseLeave={handleBarMouseLeave}
                          >
                            <span className="tl-bar-label">{row.name}</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          className="tl-bar tl-task-bar"
                          style={{
                            left: leftPx,
                            width: widthPx,
                            backgroundColor: row.accentColor,
                          }}
                          onMouseEnter={(e) => handleBarMouseEnter(e, row)}
                          onMouseLeave={handleBarMouseLeave}
                          onClick={() => row.task && onSelectTask?.(row.task)}
                        >
                          <span className="tl-bar-label">{row.name}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global Today Vertical Red Line */}
          {todayIndex >= 0 && todayIndex < totalDays && (
            <div
              className="tl-today-line"
              style={{ left: 320 + todayIndex * columnWidth + columnWidth / 2 }}
            >
              <div className="tl-today-pin">Hôm nay</div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {tooltip.visible && (
        <div
          className="tl-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="tl-tooltip-title">{tooltip.title}</div>
          <div className="tl-tooltip-sub">{tooltip.subtitle}</div>
          {tooltip.details.map((d, i) => (
            <div key={i} className="tl-tooltip-detail">
              {d}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
