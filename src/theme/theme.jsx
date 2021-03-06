import createBreakpoints from "@material-ui/core/styles/createBreakpoints";

import AcuminTTF from "../assets/fonts/WorkSans-VariableFont_wght.ttf";

const Acumin = {
  fontFamily: "Acumin Variable Concept",
  fontStyle: "normal",
  fontWeight: 400,
  src: `
    local('Acumin Variable Concept'),
    local('Acumin Variable Concept'),
    url(${AcuminTTF}) format('truetype')
  `,
};

export const colorsGuru = {
  cgGreen: "#79d8a2",
  cgOrange: "#f79d6b",
  cgYellow: "#fcc98b",
  cgBlue: "#9de2f9",
  cgRed: "#ed867c",
};

export const colors = {
  cgBlack: "#000000",
  cgRed: "#ed867c",
  cgOrange: "#f79d6b",
  cgYellow: "#fcc98b",
  cgBlue: "#9de2f9",
  cgGreen: "#79d8a2",
  cgDarkGreen: "#569973",
  white: "#ffffff",
  black: "#000000",
  darkBlue: "#2c3b57",
  blue: "#2F80ED",
  gray: "#e1e1e1",
  lightGray: "#737373",
  lightBlack: "#6a6a6a",
  darkBlack: "#141414",
  green: "#1abc9c",
  red: "#ed4337",
  orange: "orange",
  pink: "#DC6BE5",
  compoundGreen: "#00d395",
  tomato: "#e56b73",
  purple: "#935dff",
  text: "#212529",
  lightBlue: "#2F80ED",
  topaz: "#0b8f92",
  darkGray: "rgba(43,57,84,.5)",
  borderBlue: "rgba(25, 101, 233, 0.5)",

  buttonPrimary: "#0b8f92",
  buttonSecondary: "#ed4337",
};

function getMode() {
  let savedmode;
  try {
    savedmode = JSON.parse(localStorage.getItem("dark"));
    return savedmode || true;
  } catch (err) {
    return true;
  }
}

const breakpoints = createBreakpoints({
  keys: ["xs", "sm", "md", "lg", "xl"],
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1800,
  },
});

const cgTheme = {
  typography: {
    fontFamily: ["Acumin Variable Concept"].join(","),
    h1: {
      fontSize: "48px",
      fontWeight: "600",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "36px",
      fontWeight: "600",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2,
    },
    h3: {
      fontSize: "28px",
      fontWeight: "600",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2,
    },
    h4: {
      fontSize: "20px",
      fontWeight: "600",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2,
    },
    h5: {
      fontSize: "16px",
      fontWeight: "600",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2,
    },
    h6: {
      fontSize: "14px",
      fontWeight: "600",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2,
    },
    body1: {
      fontSize: "16px",
      fontWeight: "300",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    body2: {
      fontSize: "15px",
      fontWeight: "300",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
  },
  palette: {
    type: getMode() ? "dark" : "light",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        "@font-face": [Acumin],
      },
    },
    MuiSelect: {
      select: {
        padding: "9px",
      },
      selectMenu: {
        minHeight: "30px",
        display: "flex",
        alignItems: "center",
      },
    },
    MuiButton: {
      root: {
        borderRadius: "10px",
        padding: "10px 24px",
      },
      outlined: {
        padding: "10px 24px",
        borderWidth: "2px !important",
      },
      text: {
        padding: "10px 24px",
      },
      label: {
        textTransform: "none",
        fontSize: "1rem",
      },
    },
    MuiInputBase: {
      input: {
        fontSize: "16px",
        fontWeight: "600",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        lineHeight: 1.2,
      },
    },
    MuiOutlinedInput: {
      input: {
        padding: "14px",
        borderRadius: "10px",
      },
      root: {
        // border: "none !important",
        borderRadius: "5px",
      },
      notchedOutline: {
        // border: "none !important"
      },
    },
    MuiSnackbar: {
      root: {
        maxWidth: "calc(100vw - 24px)",
      },
      anchorOriginBottomLeft: {
        bottom: "12px",
        left: "12px",
        "@media (min-width: 960px)": {
          bottom: "50px",
          left: "80px",
        },
      },
    },
    MuiSnackbarContent: {
      root: {
        backgroundColor: colors.white,
        padding: "0px",
        minWidth: "auto",
        "@media (min-width: 960px)": {
          minWidth: "500px",
        },
      },
      message: {
        padding: "0px",
      },
      action: {
        marginRight: "0px",
      },
    },
    MuiAccordion: {
      root: {
        border: "1px solid rgba(0,0,0,0.2)",
        margin: "0px 0px",
        "&:before": {
          height: "0px",
        },
      },
    },
    MuiAccordionSummary: {
      root: {
        padding: "1px 24px",
        "@media (min-width: 960px)": {
          padding: "1px 24px",
        },
      },
      content: {
        margin: "0px !important",
      },
    },
    MuiAccordionDetails: {
      root: {
        padding: "0 10px 5px 10px",
        "@media (min-width: 960px)": {
          padding: "0 20px 5px 20px",
        },
      },
    },
    MuiToggleButton: {
      root: {
        borderRadius: "50px",
        textTransform: "none",
        minWidth: "100px",
        border: "none",
        "& > span > h4": {
          color: "#555",
        },
        "&:hover": {
          backgroundColor: "rgba(47,128,237, 0.2)",
        },
        "&$selected": {
          backgroundColor: "#2f80ed",
          "& > span > h4": {
            color: "#fff",
          },
          "&:hover": {
            backgroundColor: "rgba(47,128,237, 0.2)",
            "& > span > h4": {
              color: "#000",
            },
          },
        },
      },
    },
    MuiPaper: {
      root: {
        background: getMode()
          ? "rgba(255,255,255,0.1)"
          : "rgba(255, 255, 255, 0.75)",
      },
      elevation1: {
        boxShadow: "none",
      },
    },
    MuiToggleButtonGroup: {
      root: {
        border: "1px solid " + colors.borderBlue,
        borderRadius: "50px",
      },
      groupedSizeSmall: {
        padding: "42px 30px",
      },
    },
    MuiFormControlLabel: {
      label: {
        color: colors.darkBlack,
        fontSize: "14px",
        fontWeight: "600",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        lineHeight: 1.2,
      },
    },
  },
  // palette: {
  //   primary: {
  //     main: colors.buttonPrimary,
  //   },
  //   secondary: {
  //     main: colors.buttonSecondary,
  //   },
  //   text: {
  //     primary: colors.text,
  //     secondary: colors.text,
  //   },
  // },
  breakpoints: breakpoints,
};

export default cgTheme;
