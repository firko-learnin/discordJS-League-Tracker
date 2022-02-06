export default async function clear(message) {
  let fetched;
  do {
    const fetched = await message.channel.messages.fetch({ limit: 100 });
    message.channel.bulkDelete(fetched);
  } while (fetched.size >= 2);
}
