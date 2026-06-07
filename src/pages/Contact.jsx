function Contact() {
  return (
    <section className="min-h-screen bg-[#f7f3ef] flex items-center justify-center px-6">

      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl">

        <h1 className="text-5xl font-black text-[#2d1f18] mb-8">
          Contact Us
        </h1>

        <div className="space-y-6">

          <input
            type="text"
            placeholder="Your Name"
            className="w-full bg-[#f5f5f5] px-6 py-4 rounded-xl outline-none"
          />

          <input
            type="email"
            placeholder="Your Email"
            className="w-full bg-[#f5f5f5] px-6 py-4 rounded-xl outline-none"
          />

          <textarea
            rows="5"
            placeholder="Your Message"
            className="w-full bg-[#f5f5f5] px-6 py-4 rounded-xl outline-none"
          ></textarea>

          <button className="w-full bg-[#3b281f] hover:bg-[#2a1c15] transition-all duration-300 text-white py-4 rounded-xl font-semibold">
            Send Message
          </button>

        </div>

      </div>

    </section>
  )
}

export default Contact