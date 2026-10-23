import BarraAvisos from './BarraAvisos'
import HeaderMenu from './HeaderMenu'

export default function Header() {
    return (
        <header className="border-b border-stone-200 bg-white text-stone-900">
            <BarraAvisos />
            <HeaderMenu />
        </header>
    )
}
