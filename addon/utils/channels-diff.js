function channelIncluded(channelData, channelsList) {
  const [channelName] = Object.keys(channelData);
  return channelsList.indexOf(channelName) < 0;
}

export function removeChannel(channelsData, channelName) {
  return channelsData.filter((channel) => {
    return Object.keys(channel)[0] !== channelName;
  });
}

export function channelsDiff(oldChannelsData, newChannelsData) {
  const oldChannels = oldChannelsData.map(channel => Object.keys(channel)[0]);
  const newChannels = newChannelsData.map(channel => Object.keys(channel)[0]);
  const channelsToUnsubscribe = oldChannelsData
    .filter((channel) => channelIncluded(channel, newChannels));
  const channelsToSubscribe = newChannelsData
    .filter((channel) => channelIncluded(channel, oldChannels));

  return { channelsToUnsubscribe, channelsToSubscribe };
}
