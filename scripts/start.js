/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */
const { server, constants } = require('../build');

server.listen(constants.PORT, constants.HOSTNAME, () => {
  console.log(`Listening on ${!!constants.HOSTNAME.match(/^http/) ? constants.HOSTNAME : `http://${constants.HOSTNAME}`}:${constants.PORT}`);
});
