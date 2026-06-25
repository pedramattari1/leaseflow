import { useRef, useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AppCard from './AppCard'

const STAGES = [
  { key: 'applied', label: 'Applied' },
  { key: 'screening', label: 'Screening' },
  { key: 'approved', label: 'Approved' },
  { key: 'lease_sent', label: 'Lease Sent' },
  { key: 'lease_executed', label: 'Lease Executed' },
  { key: 'move_in_scheduled', label: 'Move-in Scheduled' },
]

const stageColors = {
  applied: 'bg-stage-applied',
  screening: 'bg-stage-screening',
  approved: 'bg-stage-approved',
  lease_sent: 'bg-stage-lease-sent',
  lease_executed: 'bg-stage-executed',
  move_in_scheduled: 'bg-stage-move-in',
}

export default function KanbanBoard({ applications, onMoveStage, onSelect }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', updateScrollState)
    window.addEventListener('resize', updateScrollState)
    return () => {
      if (el) el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [applications])

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  const grouped = {}
  for (const s of STAGES) grouped[s.key] = []
  for (const app of applications) {
    if (grouped[app.pipeline_stage]) grouped[app.pipeline_stage].push(app)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return
    const appId = result.draggableId
    const newStage = result.destination.droppableId
    const app = applications.find((a) => a.id === appId)
    if (app && app.pipeline_stage !== newStage) {
      onMoveStage(appId, newStage)
    }
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-full shadow-md cursor-pointer hover:bg-surface-hover"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-full shadow-md cursor-pointer hover:bg-surface-hover"
        >
          <ChevronRight size={16} />
        </button>
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          ref={scrollRef}
          className="flex gap-3 pb-4 min-h-[400px] kanban-scroll"
        >
          {STAGES.map((stage) => (
            <Droppable key={stage.key} droppableId={stage.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-shrink-0 w-60 min-w-[240px] rounded-lg p-3 ${
                    snapshot.isDraggingOver ? 'border-2 border-dashed border-primary-light bg-primary-light/30' : 'bg-bg'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${stageColors[stage.key]}`} />
                    <h3 className="text-sm font-semibold text-text-primary">{stage.label}</h3>
                    <span className="text-xs font-medium text-text-tertiary bg-surface-hover px-1.5 py-0.5 rounded tabular-nums">
                      {grouped[stage.key].length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {grouped[stage.key].map((app, idx) => (
                      <Draggable key={app.id} draggableId={app.id} index={idx}>
                        {(dragProvided, dragSnapshot) => (
                          <AppCard
                            app={app}
                            onClick={() => onSelect(app)}
                            provided={dragProvided}
                            snapshot={dragSnapshot}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
