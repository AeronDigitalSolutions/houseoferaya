export function placeholderResponse(endpoint: string, data: Record<string, unknown> = {}, status = 200) {
  return Response.json(
    {
      success: true,
      endpoint,
      message: "Placeholder API response. Connect business logic and database operations.",
      data
    },
    { status }
  );
}
