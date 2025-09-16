import Navbar from "./widgets/Navbar";

function App() {
  return (
    <>
      <div data-theme="lightTheme">
        <Navbar />
        <section className="relative min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
          <div className="mb-80 z-10">
            <h1 className="text-4xl md:text-6xl font-semibold max-w-3xl leading-loose too-tight-text">
              Grow More and Waste less with{" "}
              <span className="bg-gradient-to-t from-primary to-secondary text-white px-3 py-1 rounded-xl font-bold inline-block">
                Soiltrack
              </span>
            </h1>

            <p className="mt-6 text-lg font-medium text-gray-600 max-w-3xl">
              SoilTrack is a smart farming system designed to help farmers
              monitor soil moisture and nutrient levels (NPK). With IoT-powered
              sensors and a mobile app, you’ll always know exactly what your
              soil needs—no more guesswork, no more waste.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button className="btn bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700">
                Inquire Now
              </button>
              <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
                Request a Survey
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 w-full flex justify-center z-0">
            <img
              src="../public/BG.png"
              alt="Gradient Background"
              className="w-full h-auto"
            />
          </div>

          <div className="absolute bottom-0 w-full flex justify-center">
            <img
              src="../public/landing_image.png"
              alt="Soiltrack App Preview"
              className="w-[400px] md:w-[750px] h-auto"
            />
          </div>
        </section>

        <section>
          <div className="flex flex-col items-center py-12">
            <span className="uppercase text-sm text-gray-500 tracking-widest mb-2">
              In partnership with
            </span>
            <div className="flex flex-wrap gap-8 justify-center items-center mt-2">
              {/* Example partner logos */}
              <img
                src="../public/partners/otis.png"
                alt="Partner 1"
                className="h-10"
              />
              <img
                src="../public/partners/otis.png"
                alt="Partner 2"
                className="h-10"
              />
              <img
                src="../public/partners/otis.png"
                alt="Partner 3"
                className="h-10"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
