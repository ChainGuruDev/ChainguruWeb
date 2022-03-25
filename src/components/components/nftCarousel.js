import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import { colors } from "../../theme";

const useStyles = makeStyles((theme) => ({
  rootGallery: {
    "*, &:before, &:after": {
      boxSizing: "border-box",
      position: "relative",
    },
    margin: 50,
  },
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    margin: 0,
    padding: 0,
    fontSize: "3vmin",
  },
  body: {
    height: "100%",
    width: "100%",
    margin: 0,
    padding: 0,
    fontSize: "3vmin",
  },
  html: {
    background: "#151515",
    color: "#fff",
    overflow: "hidden",
  },
  body: {},
  slides: {
    display: "grid",
    "& .slide": {
      gridArea: "1 / -1",
    },
    "& .button": {
      appearance: "none",
      background: "transparent",
      border: "none",
      color: "white",
      position: "absolute",
      fontSize: "5rem",
      width: "5rem",
      height: "5rem",
      top: "30%",
      transition: "opacity 0.3s",
      opacity: "0.7",
      zIndex: "5",
      "&:hover": {
        opacity: 1,
      },
      "&:focus": {
        outline: "none",
      },
      "&:first-child": {
        left: "-50%",
      },
      "&:last-child": {
        right: "-50%",
      },
    },
    "& .slideContent": {
      width: "100%",
      height: "600px",
      backgroundSize: "contain",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      transition: "transform 0.5s ease-in-out",
      opacity: "0.7",
      display: "grid",
      alignContent: "end",
      transformStyle: "preserve-3d",
      transform:
        "perspective(1000px) translateX(calc(100% * var(--offset))) rotateY(calc(-45deg * var(--dir)))",
    },
    "& .slideBackground": {
      filter: "blur(25px)",
      position: "fixed",
      top: 0,
      left: "-10%",
      right: "-10%",
      bottom: 0,
      backgroundSize: "cover",
      backgroundPosition: "center center",
      zIndex: -1,
      opacity: 0,
      transition: "opacity 0.3s linear, transform 0.3s ease-in-out",
      pointerEvents: "none",
      transform: "translateX(calc(10% * var(--dir)))",
    },
    "& .slideContentInner": {
      transformStyle: "preserve-3d",
      transform: "translateZ(2rem)",
      transition: "opacity 0.3s linear",
      textShadow: "0 0.1rem 1rem #000",
      opacity: "0",
      textAlign: "left",
      marginBottom: "5%",
      "& .slideSubtitle": {},
      "& .slideTitle": {
        margin: 0,
      },
      "& .slideSubtitle": {
        "&:before": {
          content: "— ",
        },
      },
      "& .slideDescription": {
        margin: 0,
        fontSize: "0.8rem",
        letterSpacing: "0.2ch",
      },
    },
  },
  slide: {
    //transform-style: preserve-3d;
    // border: solid 1px red;
    // &[data-active] {
    //   .slideContent > * {
    //     transform: none;
    //     opacity: 1;
    //   }
    // }
  },

  slideContentInner: {
    transformStyle: "preserve-3d",
    transform: "translateZ(2rem)",
    transition: "opacity 0.3s linear",
    textShadow: "0 0.1rem 1rem #000",
    opacity: "0",
    "& .slideSubtitle": {},
    "& .slideTitle": {
      fontSize: "2rem",
      fontWeight: "normal",
      letterSpacing: "0.2ch",
      textTransform: "uppercase",
      margin: 0,
    },
    "& .slideSubtitle": {
      "&:before": {
        content: "— ",
      },
    },
    "& .slideDescription": {
      margin: 0,
      fontSize: "0.8rem",
      letterSpacing: "0.2ch",
    },
  },
  slideActive: {
    zIndex: 2,
    pointerEvents: "auto",

    "& .slideBackground": {
      opacity: 0.2,
      transform: "none",
      filter: "blur(25px)",
    },

    "& .slideContentInner": {
      opacity: 1,
    },

    "& .slideContent": {
      "--x": "calc(var(--px) - 0.5)",
      "--y": "calc(var(--py) - 0.5)",
      opacity: 1,
      transform: "perspective(1000px)",
      "&:hover": {
        transition: "none",
        transform:
          "perspective(1000px) rotateY(calc(var(--x) * 45deg)) rotateX(calc(var(--y) * -45deg))",
      },
    },
  },
}));

function useTilt(active) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || !active) {
      return;
    }

    const state = {
      rect: undefined,
      mouseX: undefined,
      mouseY: undefined,
    };

    let el = ref.current;

    const handleMouseMove = (e) => {
      if (!el) {
        return;
      }
      if (!state.rect) {
        state.rect = el.getBoundingClientRect();
      }
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      const px = (state.mouseX - state.rect.left) / state.rect.width;
      const py = (state.mouseY - state.rect.top) / state.rect.height;

      el.style.setProperty("--px", px);
      el.style.setProperty("--py", py);
    };

    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, [active]);

  return ref;
}

const initialState = {
  slideIndex: 0,
};

const slidesReducer = (state, event) => {
  if (event.type === "PREV") {
    return {
      ...state,
      slideIndex: (state.slideIndex + 1) % event.items.length,
    };
  }
  if (event.type === "NEXT") {
    return {
      ...state,
      slideIndex:
        state.slideIndex === 0 ? event.items.length - 1 : state.slideIndex - 1,
    };
  }
};

function Slide({ slide, offset }) {
  const active = offset === 0 ? true : null;
  const ref = useTilt(active);
  const classes = useStyles();
  return (
    <div
      ref={ref}
      className={`slide ${active && classes.slideActive}`}
      data-active={active}
      style={{
        "--offset": offset,
        "--dir": offset === 0 ? 0 : offset > 0 ? 1 : -1,
      }}
    >
      <div
        className="slideBackground"
        style={{
          backgroundImage: `url('${slide.asset.preview.url}')`,
        }}
      />
      <div
        className="slideContent"
        style={{
          backgroundImage: `url('${
            slide.asset.preview.url ? slide.asset.preview.url : "none"
          }')`,
        }}
      >
        <div className="slideContentInner">
          <h4 className="slideTitle">{slide.asset.name}</h4>
          <p className="slideDescription">{slide.asset.collection.name}</p>
        </div>
      </div>
    </div>
  );
}

function NFTCarousel(props) {
  const classes = useStyles();
  const [galleryItems, setGalleryItems] = useState([]);
  useEffect(() => {
    if (props.galleryItems) {
      setGalleryItems(props.galleryItems);
    }
  });
  const [state, dispatch] = React.useReducer(slidesReducer, initialState);

  return (
    <div className={classes.root}>
      <div className={classes.rootGallery}>
        <div className={classes.slides}>
          <button
            className="button"
            onClick={() => dispatch({ type: "PREV", items: galleryItems })}
          >
            ‹
          </button>

          {[...galleryItems, ...galleryItems, ...galleryItems].map(
            (slide, i) => {
              let offset = galleryItems.length + (state.slideIndex - i);
              return <Slide slide={slide} offset={offset} key={i} />;
            }
          )}
          <button
            className="button"
            onClick={() => dispatch({ type: "NEXT", items: galleryItems })}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default NFTCarousel;
