/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */
const { server, constants } = require('../build');

/**
 * @type {number | undefined}
 */
const port = constants.PORT == 80 ? undefined : constants.PORT;

server.listen(port, constants.HOSTNAME, () => {
  console.log(`Listening on ${!!constants.HOSTNAME.match(/^http/) ? constants.HOSTNAME : `http://${constants.HOSTNAME}`}${port ? `:${port}` : ''}`);
});
