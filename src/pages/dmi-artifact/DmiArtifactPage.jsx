import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { AiOutlineClose } from "react-icons/ai";
import TextBox from "../../common/textBox/TextBox";
import "./DmiArtifactPage.scss";

const DmiArtifactPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [imageContent, setImageContent] = useState({
    content: {
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/jakobloehrer-portfolio.firebasestorage.app/o/projects%2FsectionImages%2FcylistMetahphore.png?alt=media&token=75e86584-f2ad-47ed-ba7f-5b7c4a060db3",
      title: "Bicycle Metaphor illustration",
    },
  });

  const openImageModal = (content) => {
    setModalImage({ imageUrl: content.imageUrl, title: content.title });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  return (
    <>
      <div className="project-page">
        <div className="project-wrapper">
          <div className="header">
            <div className="title-wrapper">
              <h1>Limits to Growth</h1>
            </div>
          </div>
          <div className="project-content">
            <section className="section1">
              <div className="quote">
                “Overshoot can lead to two different outcomes. One is a crash of
                some kind. Another is a deliberate turnaround, a correction, a
                careful easing down.”
              </div>
              <div className="section1-content">
                <TextBox
                  className="text"
                  text={
                    "This quote became the center of my understanding, and the reason I chose the downhill bicycle metaphor for my artefact. It helped me visualize the situation clearly: society is the cyclist, speeding downhill with growing momentum; the upcoming curve represents the planetary limits; design, policy, and collective decisions are the brakes. Reading the chapters made me realize that overshoot is not a future threat, we are already in the curve’s approach. The choice is simple: pull the brakes in time and guide a controlled turn, or ignore the limits and crash. The metaphor captures the urgency and responsibility embedded in the quote."
                  }
                ></TextBox>

                <button
                  className="image-wrapper widget"
                  onClick={() => openImageModal(imageContent.content)}
                >
                  <img
                    src={imageContent.content?.imageUrl}
                    alt={imageContent.content.title}
                  />
                  <span>{imageContent.content.title}</span>
                </button>
              </div>
            </section>

            <section className="section2">
              <TextBox
                className="textBox"
                title={"How the Book Shifted My View of DMI"}
                text={
                  "Before reading these chapters, I saw Design Management mostly as shaping products, services, or experiences. Now I understand it as shaping systems, especially systems under pressure. The idea of sources and sinks, the flows our economy depends on, made me see that design cannot be neutral: it either accelerates the downhill ride or helps manage the turn. DMI becomes a discipline that translates planetary limits into decisions, strategies, and narratives people can act on. Instead of improving within the old model, Design Managers must help redesign the model itself. This shift changed my understanding of what responsibility and direction mean in the field."
                }
              ></TextBox>
              <TextBox
                className="textBox"
                title={"What I Learned from the Chapters"}
                text={
                  "Reading the chapters changed how I think about growth, limits, and the world I live in. I now understand overshoot not as a dramatic event but as a condition, a mismatch between how fast we grow and how slowly the planet reacts. I learned that sink limits often hit earlier and harder than source limits, and this changed how I think about “running out” of resources. The throughput model helped me see the economy as a physical system, not an abstract one. Most importantly, I realized that the future is not fixed: collapse is possible, but so is a deliberate easing down. This understanding now shapes how I see myself as a designer, as someone who must help guide that turn instead of waiting for the crash."
                }
              ></TextBox>
            </section>
          </div>
        </div>
      </div>
      {modalOpen &&
        ReactDOM.createPortal(
          <>
            <div className="overlay" onClick={closeModal}>
              {" "}
            </div>

            <div className="modal">
              <div className="modal-wrapper">
                <div className="modal-header">
                  <h2>{modalImage.title}</h2>
                  <button className="close-button" onClick={closeModal}>
                    <AiOutlineClose />
                  </button>
                </div>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={modalImage.imageUrl}
                    alt="Modal View"
                    className="modal-image"
                  />
                </div>
              </div>
            </div>
          </>,
          document.getElementById("modal-root")
        )}
    </>
  );
};

export default DmiArtifactPage;
