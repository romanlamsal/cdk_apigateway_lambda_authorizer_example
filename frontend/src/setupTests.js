const fullIcu = require("full-icu")
import Adapter from 'enzyme-adapter-react-16'
const Enzyme = require("enzyme")

Enzyme.configure({adapter: new Adapter()})
