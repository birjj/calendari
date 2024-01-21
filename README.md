# Calendari - serverless calendar management and merge API

Calendari (_/ka.lenˈda.ɾi/_) is a tool to manage and merge calendars across platforms. It consists of a set of API routes to create, update and delete calendar events in a given calendar, and an endpoint that exposes the complete set of events in the iCal format.

It is designed to use serverless functions rather than a dedicated server, to make it easy to host as a hobby project.

## API endpoints

The initial setup is done through the web interface, available at the `/` endpoint of the application. This allows you to manage your calendars, and generate API keys for each.

### Calendar modification

Each of these endpoints require the header `X-API-Key` to be set to an API key with access to the given calendar.

| Endpoint                       | Description                                                                                                                                                  | Data format                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| POST `<calendar>/event`        | Creates a new event with a server-generated ID. The ID is returned in the response body object.                                                              | JSON&nbsp;`Event`           |
| PUT `<calendar>/event/<id>`    | Creates a new event with the given ID. The ID is generated client-side (usually as a GUID or UUID) and must not conflict with another event in the calendar. | JSON:&nbsp;`Event`          |
| PATCH `<calendar>/event/<id>`  | Updates the event with the given ID. The ID is the same as was used in the initial POST event.                                                               | JSON:&nbsp;`Partial<Event>` |
| DELETE `<calendar>/event/<id>` | Complete deletes the event with the given ID.                                                                                                                | None                        |
| GET `<calendar>`               | Gets the given calendar, either as JSON (if `Accept: application/json` is set in the request), or as iCal                                                    | None                        |

## Development

To run the project, it is recommended to use the existing [devcontainer](https://containers.dev/). This can be done through VSCode, GitHub, etc. - choose an option that works for you.

The site is currently set up to run on Netlify, with Netlify Functions as the serverless functions provider. This is used to handle env variables (for social login secrets like `GITHUB_CLIENT_ID`, etc.)
