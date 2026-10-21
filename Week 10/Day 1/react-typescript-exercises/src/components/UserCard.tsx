interface UserCardProps {
  name?: string;
  age?: number;
  role?: string;
}

function UserCard({
  name = "Guest user",
  age = 25,
  role = "Learner",
}: UserCardProps) {
  return (
    <article className="user-card">
      <span className="user-avatar" aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="user-card-details">
        <h3>{name}</h3>
        <p>{role}</p>
        <span className="age-pill">{age} years old</span>
      </div>
    </article>
  );
}

export default UserCard;
