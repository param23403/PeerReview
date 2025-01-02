import { useState, useEffect, useRef } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import TeamCard from "../../components/TeamCard"
import Spinner from "../../components/Spinner"
import { Link } from "react-router-dom" // Import Link

const fetchTeams = async ({ pageParam = 1 }: { queryKey: any; pageParam?: number }) => {
  const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/teams/getTeams`, {params: { page: pageParam, limit: 20 }})
  return response.data
}

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]) 
  const observerRef = useRef<HTMLDivElement | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < 20 ? undefined : allPages.length + 1
    },
    initialPageParam: 1,
  })

  useEffect(() => {
    if (data) {
      setTeams((prevTeams) => {
        const newTeams = data.pages.flat()
        const uniqueTeams = [
          ...prevTeams,
          ...newTeams.filter((newTeam) => !prevTeams.some((team) => team.id === newTeam.id))
        ]
        return uniqueTeams
      })
    }
  }, [data])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1.0 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-primary text-center">Teams</h1>

      {isError && <div className="text-destructive-foreground">Error: {error instanceof Error ? error.message : "Failed to fetch teams"}</div>}

      <div className="flex flex-col space-y-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => <TeamCard key={index} loading />)
          : teams.map((team: any) => (
              <Link key={team.id} to={`/teams/${team.id}`}>
                <TeamCard
                  teamName={team.id}
                  students={team.students}
                />
              </Link>
            ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}

      <div ref={observerRef} className="h-1"></div>
    </div>
  )
}

export default Teams
