export function roomPath(code: string) {
  return `rooms/${code}`;
}

export function roomParticipantsPath(code: string) {
  return `rooms/${code}/participants`;
}

export function roomParticipantPath(code: string, userId: string) {
  return `rooms/${code}/participants/${userId}`;
}

export function auctionPath(code: string) {
  return `auctions/${code}`;
}

export function chatPath(code: string) {
  return `chats/${code}`;
}

export function publicRoomsPath() {
  return 'publicRooms';
}

export function publicRoomPath(code: string) {
  return `publicRooms/${code}`;
}
