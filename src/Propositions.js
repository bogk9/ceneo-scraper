import "./Propositions.css";
import { Transition } from "react-transition-group";

const duration = 300;

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
};

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};

function Propositions(props) {
  if (props.propositions.length == 0 && props.zeroProductSearch === false)
    return null;

  let propositionsElements = props.propositions.map((el, ind) => (
    <div className="oneItem" key={el.id}>
      <span>
        <a href={"https://www.ceneo.pl/" + el.id} target="_blank">
          {el.name}
        </a>
      </span>
      <button
        className="button is-primary is-small"
        onClick={(e) => props.handlePropositionClick(el.name, el.id)}
      >
        Dodaj
      </button>
    </div>
  ));

  return (
    <div className="flexContainer">
      <div className="box itemsPicked propositions">
        <h4 id="boxInfo">Który produkt Cię interesuje?</h4>
        <hr></hr>
        {propositionsElements}
        {props.zeroProductSearch && (
          <span className="zeroSearch">
            Nie znaleziono żadnego produktu o podanej nazwie
          </span>
        )}
      </div>
    </div>
  );
}

export default Propositions;
