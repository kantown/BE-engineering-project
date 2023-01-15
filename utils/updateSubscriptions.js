const updateSubscriptions = (user) => {
  const millisecondsInDay = 86_400_000;
  if (!user.subs.length) {
    return;
  }

  user.subs.forEach(({ period, payment }, index) => {
    let newDate = Date.parse(payment);
    while (newDate < Date.parse(new Date())) {
      switch (period) {
        case "week":
          newDate = Date.parse(payment) + millisecondsInDay * 7;
          break;
        case "twoWeeks":
          newDate = Date.parse(payment) + millisecondsInDay * 14;
          break;
        case "month":
          newDate = Date.parse(payment) + millisecondsInDay * 30;
          break;
        case "threeMonths":
          newDate = Date.parse(payment) + millisecondsInDay * 90;
          break;
        case "sixMonths":
          newDate = Date.parse(payment) + millisecondsInDay * 270;
          break;
        case "year":
          newDate = Date.parse(payment) + millisecondsInDay * 365;
          break;
      }
    }
    user.subs[index].payment = new Date(newDate).toISOString();
  });
  return user;
};

module.exports = updateSubscriptions;
