import { useEffect, useState } from "react";
import "./BookExample.scss";

const BookExample = () => {
  const [currentState, setCurrentState] = useState(1);
  const [page1Flipped, setPage1Flipped] = useState(false);
  const [page2Flipped, setPage2Flipped] = useState(false);
  const [page3Flipped, setPage3Flipped] = useState(false);

  const numOfPapers = 3;
  const maxState = numOfPapers + 1;

  const goNext = () => {
    if (currentState < maxState) {
      setCurrentState(currentState + 1);
    }
  };

  const goPrevious = () => {
    if (currentState > 1) {
      setCurrentState(currentState - 1);
    }
  };

  // const openBook = () => {
  //   book.style.transform = "translateX(50%)";
  //   prevBtn.style.transform = "translateX(-180px)";
  //   nextBtn.style.transform = "translateX(180px)";
  // };

  // const closeBook = (isFirstPage) => {
  //   if (isFirstPage) {
  //     book.style.transform = "translateX(0%)";
  //   } else {
  //     book.style.transform = "translateX(100%)";
  //   }
  //   prevBtn.style.transform = "translateX(0px)";
  //   nextBtn.style.transform = "translateX(0px)";
  // };

  useEffect(() => {
    switch (currentState) {
      case 1:
        setPage1Flipped(false);
        setPage2Flipped(false);
        setPage3Flipped(false);
        break;
      case 2:
        setPage1Flipped(true);
        setPage2Flipped(false);
        setPage3Flipped(false);
        break;
      case 3:
        setPage2Flipped(true);
        setPage3Flipped(false);
        break;
      case 4:
        setPage3Flipped(true);
        break;
      default:
        break;
    }
  }, [currentState]);

  return (
    <div>
      <button className="nav-btn" onClick={goPrevious}>
        left{" "}
      </button>

      <div className="book">
        <div className={`paper ${page1Flipped && "flipped"} p1`}>
          <div className="front">
            <div className="front-content">
              <h1>Front 1</h1>
            </div>
          </div>
          <div className="back">
            <div className="back-content b1">
              <h1>Back 1</h1>
            </div>
          </div>
        </div>
        <div className={`paper ${page2Flipped && "flipped"} p2`}>
          <div className="front">
            <div className="front-content">
              <h1>Front 2</h1>
            </div>
          </div>
          <div className="back">
            <div className="back-content b2">
              <h1>Back 2</h1>
            </div>
          </div>
        </div>
        <div className={`paper ${page3Flipped && "flipped"} p3`}>
          <div className="front">
            <div className="front-content">
              <h1>Front 3</h1>
            </div>
          </div>
          <div className="back">
            <div className="back-content b3">
              <h1>Back 3</h1>
            </div>
          </div>
        </div>
      </div>

      <button className="nav-btn" onClick={goNext}>
        right{" "}
      </button>
    </div>
  );
};

export default BookExample;
