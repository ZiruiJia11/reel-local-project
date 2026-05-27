import { getCurrentUser } from "../services/authService"

function Profile() {
  const user =
    getCurrentUser()

  if (!user) {
    return (
      <div>
        <h1>Profile</h1>
        <p>You are not logged in.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Profile</h1>

      <p>
        Name: {user.name}
      </p>

      <p>
        Email: {user.email}
      </p>
    </div>
  )
}

export default Profile