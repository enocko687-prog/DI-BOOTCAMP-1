interface GreetingProps {
  name: string;
  messageCount: number;
}

function Greeting({ name, messageCount }: GreetingProps) {
  const messageLabel = messageCount === 1 ? "message" : "messages";

  return (
    <div className="greeting-content">
      <span className="greeting-avatar" aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <div>
        <p className="greeting-title">Hello, {name}!</p>
        <p className="muted-copy">
          You have {messageCount} new {messageLabel}.
        </p>
      </div>
    </div>
  );
}

export default Greeting;
