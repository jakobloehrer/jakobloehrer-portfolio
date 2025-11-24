import { useTranslation } from "react-i18next";
import skeleton from "./../../assets/skeletonButterfly.png";
import TextBox from "./../../common/textBox/TextBox";
import "./About.scss";
const About = ({ forwardedRef }) => {
  const { t } = useTranslation();

  const birthDate = new Date(2004, 10, 24);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return (
    <div ref={forwardedRef} className="about">
      <div className="left-wrapper">
        <div className="portrait"></div>

        <TextBox title="ABOUT_ME" text="ABOUT_ME_TEXT" />
        <TextBox
          title="CHARACTERISTICS"
          text={t("CHARACERISTICS_TEXT", { age })}
        />
      </div>
      <div className="right-wrapper">
        <div className="title">
          <div className="overlap-group">
            <div className="text-wrapper">{t("HELLO_IM")}</div>
            <div className="text-wrapper-2">Jakob</div>
            <div className="text-wrapper-3">{t("AND_IM_A")}</div>
            <div className="text-wrapper-4">Frontend Developer</div>
          </div>
        </div>

        <div className="whatDrivesMe-wrapper">
          <div className="dieText">{t("DIE_TEXT")}</div>
          <TextBox text="WHAT_DRIVES_ME_TEXT" />
        </div>
        <div className="image-wrapper">
          <img src={skeleton} alt="Skeleton with Butterfly" />
        </div>
      </div>
    </div>
  );
};

export default About;
