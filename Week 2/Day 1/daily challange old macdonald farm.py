class Phone:
    def __init__(self, phone_number):
        self.phone_number = phone_number
        self.call_history = []
        self.messages = []

    def call(self, other_phone):
        call = f"{self.phone_number} called {other_phone.phone_number}"
        print(call)
        self.call_history.append(call)

    def show_call_history(self):
        print(self.call_history)

    def send_message(self, other_phone, content):
        message = {
            "to": other_phone.phone_number,
            "from": self.phone_number,
            "content": content
        }

        self.messages.append(message)

        if other_phone is not self:
            other_phone.messages.append(message)

    def show_outgoing_messages(self):
        for message in self.messages:
            if message["from"] == self.phone_number:
                print(message)

    def show_incoming_messages(self):
        for message in self.messages:
            if message["to"] == self.phone_number:
                print(message)

    def show_messages_from(self, phone_number):
        for message in self.messages:
            if message["from"] == phone_number:
                print(message)


phone_1 = Phone("111-111-1111")
phone_2 = Phone("222-222-2222")

phone_1.call(phone_2)
phone_1.show_call_history()

phone_1.send_message(phone_2, "Hello!")
phone_2.send_message(phone_1, "Hi, how are you?")

print("Phone 1 outgoing messages:")
phone_1.show_outgoing_messages()

print("Phone 1 incoming messages:")
phone_1.show_incoming_messages()

print("Messages from phone 2:")
phone_1.show_messages_from(phone_2.phone_number)