const Footer = () => {
  return (
    <footer className="bg-gunmetal border-t border-slateSteel py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-slateSteel rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-softGray rounded-full"></div>
                </div>
                <span className="font-display font-bold text-white">RepairLy</span>
            </div>
            <p className="text-sm text-white">© 2026 RepairLy Marketplace.</p>
        </div>
    </footer>
  )
}

export default Footer;