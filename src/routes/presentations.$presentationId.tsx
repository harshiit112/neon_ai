import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/presentations/$presentationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { presentationId } = Route.useParams();
  const navigate = useNavigate();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  return <div>Hello "/presentation/$presentationld"!</div>
}
