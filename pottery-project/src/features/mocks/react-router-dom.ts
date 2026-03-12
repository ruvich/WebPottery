const reactRouterDom = jest.requireActual('react-router-dom');

module.exports = {
  ...reactRouterDom,
  useNavigate: () => jest.fn(),
};