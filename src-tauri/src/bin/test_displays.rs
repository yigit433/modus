fn main() {
    #[cfg(target_os = "macos")]
    {
        use core_graphics::display::CGDisplay;
        let displays = CGDisplay::active_displays().unwrap();
        for d in displays {
            let bounds = d.bounds();
            println!("display bounds: {:?}", bounds);
        }
    }
}
